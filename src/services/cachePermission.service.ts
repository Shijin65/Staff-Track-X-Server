// @ts-ignore
import db from "../models";
import { logger } from "../config/loggerConfig";

interface PermissionCache {
  [category: string]: {
    [title: string]: string;
  };
}

let permissionCache: PermissionCache = {};

/**
 * Load permissions from database and store in memory
 */
const loadPermissions = async (): Promise<void> => {
  try {
    const dbPermissions = await (db as any).permissions.findAll({
      attributes: ["category", "title", "permissionId"],
      raw: true,
    });

    permissionCache = {};

    dbPermissions.forEach(
      ({
        category,
        title,
        permissionId,
      }: {
        category: string;
        title: string;
        permissionId: string;
      }) => {
        if (!permissionCache[category]) {
          permissionCache[category] = {};
        }

        permissionCache[category][title] = permissionId;
      }
    );

    logger.info("Permissions loaded into memory cache");
  } catch (error: any) {
    logger.error(`Permission cache load error: ${error.message}`);
  }
};

/**
 * Get permission id
 */
const getPermissionId = (category: string, title: string): string | null => {
  return permissionCache?.[category]?.[title] || null;
};

/**
 * Get all permissions
 */
const getAllPermissions = (): PermissionCache => permissionCache;

/**
 * Reload permissions
 */
const reloadPermissions = async (): Promise<void> => {
  await loadPermissions();
};

export {
  loadPermissions,
  getPermissionId,
  getAllPermissions,
  reloadPermissions,
};

export default {
  loadPermissions,
  getPermissionId,
  getAllPermissions,
  reloadPermissions,
};