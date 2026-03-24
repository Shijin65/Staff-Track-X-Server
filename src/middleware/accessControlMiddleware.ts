import { Request, Response, NextFunction, RequestHandler } from "express";

import { logger } from "../config/loggerConfig";
import { ADMIN_ROLE_ID } from "../constants/valueConstant";

import db from "../models";
import { redisStore, ApiResponse } from "../utils";

const RolePermissions = db.role_permissions;

interface AuthRequest extends Request {
  user?: {
    userId: string;
    roleId: string;
    isSuperAdmin: boolean;
  };
}

/**
 * Middleware to check if a user's role has the required permissions
 * @param accessKeys Array of Redis keys without prefix
 * Example: ["User Roles,Update Role","Settings,Email Integration"]
 */
const accessControl = (accessKeys: string[] = []): RequestHandler => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res
          .status(404)
          .json(new ApiResponse(404, "User not authenticated."));
      }

      if (!req.user.isSuperAdmin && req.user.roleId !== ADMIN_ROLE_ID) {
        const userRoleId = req.user.roleId;

        // Convert accessKeys → redis key objects
        const redisKeys = accessKeys
          .map((key) => {
            const [category, apiName] = key.split(",");
            if (!category || !apiName) return null;
            return { category, apiName };
          })
          .filter((key): key is { category: string; apiName: string } => key !== null);

        if (redisKeys.length === 0) {
          return res
            .status(403)
            .json(
              new ApiResponse(403, "Access denied. Insufficient permissions.")
            );
        }

        // Get permission IDs from Redis
        const permissions = await redisStore.getMultiple(redisKeys);

        const permissionApiIds = permissions
          .filter((permission: any) => permission.value)
          .map((permission: any) => permission.value);

        if (permissionApiIds.length === 0) {
          return res.status(400).json(new ApiResponse(400, "Access denied."));
        }

        // Check role permissions in DB
        const rolePermissions = await RolePermissions.findAll({
          where: {
            roleId: userRoleId,
            apiId: permissionApiIds,
          },
          attributes: ["apiId"],
        });

        const userApiIds = rolePermissions.map((perm: any) => perm.apiId);

        const hasAllPermissions = permissionApiIds.every((apiId: string) =>
          userApiIds.includes(apiId)
        );

        if (!hasAllPermissions) {
          const missingPermissions = permissionApiIds.filter(
            (apiId: string) => !userApiIds.includes(apiId)
          );

          logger.warn(
            `Access denied for user ${req.user.userId}. Missing permissions: ${missingPermissions.join(
              ", "
            )}`
          );

          return res
            .status(403)
            .json(
              new ApiResponse(403, "Access denied. Insufficient permissions.")
            );
        }
      }

      next();
    } catch (error: any) {
      logger.error(`Access control error: ${error.message}`);
      return res
        .status(400)
        .json(new ApiResponse(400, "Authorization process failed."));
    }
  };
};

export default accessControl;