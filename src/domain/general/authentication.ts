import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import db from "../../models";

import {
  ApiResponse,
  getPermissionsByRoleId,
  generateTokens,
} from "../../utils";

import {
  REFRESH_SECRET_KEY,
  PASSWORD_SETUP_SECRET_KEY,
  REQUIRE_SECURE_COOKIES,
} from "../../config/envConfig";

import { logger } from "../../config/loggerConfig";
import { asyncHandler } from "../../middleware";

const User = db.users;
const UserRoles = db.user_roles;

interface DecodedToken extends JwtPayload {
  user?: {
    userId: string;
    roleId: string;
  };
  linkType?: string;
}

class Auth {
  // LOGIN
  static login = asyncHandler(async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({
        where: { email },
        include: [
          {
            model: UserRoles,
            as: "role",
            attributes: ["roleId", "title"],
          },
        ],
      });

      if (!user) {
        logger.error(`User not found with email: ${email}`);
        return res.status(404).json(new ApiResponse(404, "User not found."));
      }

      if (!user.isSuperAdmin && !user.isActive) {
        return res.status(400).json(
          new ApiResponse(
            400,
            "Your account is inactive. Please contact the administrator."
          )
        );
      }

      if (!user.isSuperAdmin && user.temporaryPassword) {
        logger.error(
          `User with email: ${email} attempted to login with a temporary password.`
        );

        return res
          .status(400)
          .json(new ApiResponse(400, "Invalid User Details", { userId: user.userId }));
      }

      const isPasswordValid = user.isSuperAdmin
        ? password === user.password
        : user.password !== null && (await user.verifyPassword(password));

      if (!isPasswordValid) {
        logger.error(`Invalid credentials for user with email: ${email}`);
        return res.status(400).json(new ApiResponse(400, "Invalid credentials."));
      }

      const userRole = {
        roleId: user.role?.roleId,
        title: user.role?.title,
      };

      const permissions = await getPermissionsByRoleId(
        userRole.roleId,
        user.isSuperAdmin
      );

      const sessionUser = {
        userId: user.userId,
        roleId: userRole.roleId,
        roleName: userRole.title,
        isSuperAdmin: user.isSuperAdmin,
      };

      const { accessToken, refreshToken } = generateTokens(sessionUser);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: REQUIRE_SECURE_COOKIES === "true",
        sameSite: REQUIRE_SECURE_COOKIES === "true" ? "none" : "lax",
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: REQUIRE_SECURE_COOKIES === "true",
        sameSite: REQUIRE_SECURE_COOKIES === "true" ? "none" : "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      if (user.tokenInvalidDateTime) {
        user.tokenInvalidDateTime = null;
        await user.save();
      }

      const responseData = {
        user: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: userRole,
          phone: user.phone,
          isSuperAdmin: user.isSuperAdmin,
          isActive: user.isActive,
        },
        availableAccess: permissions
      };

      return res.status(200).json(new ApiResponse(200, "Success.", responseData));
    } catch (error: any) {
      logger.error(`Error during login: ${error.message}`);
      return res.status(400).json(new ApiResponse(400, "Failed to login."));
    }
  });

  // REFRESH TOKEN
  static refreshToken = asyncHandler(async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res
          .status(400)
          .json(new ApiResponse(400, "No refresh token provided."));
      }

      let decoded: DecodedToken;

      try {
        decoded = jwt.verify(refreshToken, REFRESH_SECRET_KEY) as DecodedToken;
      } catch (err: any) {
        const message =
          err.name === "TokenExpiredError"
            ? "Refresh token expired."
            : "Invalid token.";

        logger.error(`Error during token refresh: ${err.message}`);
        return res.status(403).json(new ApiResponse(403, message));
      }

      if (!decoded.user?.roleId || !decoded.user?.userId) {
        return res.status(404).json(new ApiResponse(404, "Invalid token."));
      }

      const user = await User.findOne({
        where: { user_id: decoded.user.userId },
        include: [
          {
            model: UserRoles,
            as: "role",
            attributes: ["roleId", "title"],
          },
        ],
      });

      if (!user) {
        return res.status(404).json(new ApiResponse(404, "User not found."));
      }

      const userRole = {
        roleId: user.role?.roleId,
        title: user.role?.title,
      };

      if (!userRole) {
        return res.status(404).json(new ApiResponse(404, "Role not found."));
      }

      const sessionUser = {
        userId: user.userId,
        roleId: userRole.roleId,
        roleTitle: userRole.title,
        isSuperAdmin: user.isSuperAdmin,
      };

      const { accessToken, refreshToken: newRefreshToken } =
        generateTokens(sessionUser);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: REQUIRE_SECURE_COOKIES === "true",
        sameSite: REQUIRE_SECURE_COOKIES === "true" ? "none" : "lax",
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: REQUIRE_SECURE_COOKIES === "true",
        sameSite: REQUIRE_SECURE_COOKIES === "true" ? "none" : "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      const permissions = await getPermissionsByRoleId(
        userRole.roleId,
        user.isSuperAdmin
      );

      const responseData = {
        user: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isSuperAdmin: user.isSuperAdmin,
          isActive: user.isActive
        },
        role: userRole,
        permissions,
      };

      return res.status(400).json(new ApiResponse(400, "Success.", responseData));
    } catch (error: any) {
      logger.error(`Error during token refresh: ${error.message}`);
      return res
        .status(400)
        .send(new ApiResponse(400, "Authentication error."));
    }
  });

  // CHECK AUTH
  static checkAuthenticated = asyncHandler(async (req: Request, res: Response) => {
    try {
      const token = req.cookies.refreshToken || req.header("x-access-token");

      if (!token) {
        return res.status(400).json(new ApiResponse(400, "No token provided."));
      }

      let decoded: DecodedToken;

      try {
        decoded = jwt.verify(token, REFRESH_SECRET_KEY) as DecodedToken;
      } catch (err: any) {
        const message =
          err.name === "TokenExpiredError" ? "Session expired." : "Invalid token.";
        return res.status(403).json(new ApiResponse(403, message));
      }

      if (!decoded.user?.userId) {
        return res
          .status(404)
          .json(new ApiResponse(404, "Invalid token payload."));
      }

      const user = await User.findOne({
        where: { user_id: decoded.user.userId },
      });

      if (!user) {
        return res.status(404).json(new ApiResponse(404, "User not found."));
      }

      const responseData = {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        isSuperAdmin: user.isSuperAdmin,
        isActive: user.isActive,
      };

      return res.status(200).json(new ApiResponse(200, "Success.", responseData));
    } catch (error: any) {
      logger.error(`Error during check authentication: ${error.message}`);
      return res
        .status(400)
        .send(new ApiResponse(400, "Authentication error."));
    }
  });

  // LOGOUT
  static logout = asyncHandler(async (req: Request, res: Response) => {
    try {
      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: REQUIRE_SECURE_COOKIES === "true",
        sameSite: REQUIRE_SECURE_COOKIES === "true" ? "none" : "lax",
      });

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: REQUIRE_SECURE_COOKIES === "true",
        sameSite: REQUIRE_SECURE_COOKIES === "true" ? "none" : "lax",
      });

      return res.status(200).json(new ApiResponse(200, "Successfully logged out."));
    } catch (error: any) {
      logger.error(`Error during logout: ${error.message}`);
      return res.status(400).json(new ApiResponse(400, "Failed to logout."));
    }
  });
}

export default Auth;