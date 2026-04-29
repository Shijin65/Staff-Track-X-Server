import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import asyncHandler from "./asyncMiddleware";
import { ACCESS_SECRET_KEY } from "../config/envConfig";
import db from "../models";
import { logger } from "../config/loggerConfig";
import { ApiResponse } from "../utils";

const User = db.users;

interface DecodedToken extends JwtPayload {
  user: {
    userId: string;
    isSuperAdmin: boolean;
  };
}

interface AuthRequest extends Request {
  user?: {
    userId: string;
    isSuperAdmin: boolean;
  };
}

const protectedMiddleware: RequestHandler = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const accessToken = req.cookies?.accessToken;

      if (!accessToken) {
        return res
          .status(401)
          .json(new ApiResponse(401, "Token missing or invalid."));
      }

      const decoded = jwt.verify(
        accessToken,
        ACCESS_SECRET_KEY
      ) as DecodedToken;

      const { userId, isSuperAdmin } = decoded.user;

      if (!isSuperAdmin) {
        const user = await User.findByPk(userId, {
          attributes: ["tokenInvalidDateTime", "isActive"],
        });

        if (!user) {
          return res
            .status(404)
            .json(new ApiResponse(404, "User not found."));
        }

        if (!user.isActive) {
          return res.status(405).json(
            new ApiResponse(
              405,
              "Your account is inactive. Please contact the administrator."
            )
          );
        }

        const { tokenInvalidDateTime } = user.dataValues || {};

        if (tokenInvalidDateTime) {
          const tokenIssuedAt = new Date((decoded.iat ?? 0) * 1000);
          const tokenInvalidateTime = new Date(tokenInvalidDateTime);

          if (tokenIssuedAt < tokenInvalidateTime) {
            return res
              .status(401)
              .json(new ApiResponse(401, "Token invalidated."));
          }
        }
      }

      req.user = decoded.user;
      next();
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json(new ApiResponse(401, "Access token expired."));
      } else {
        logger.error(`Token verification error: ${error.message}`);
        return res.status(401).json(new ApiResponse(401, "Invalid token."));
      }
    }
  }
);

export default protectedMiddleware;