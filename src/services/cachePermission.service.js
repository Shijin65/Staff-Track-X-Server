const db = require("../models");
const { logger } = require("../config/loggerConfig");

let permissionCache = {};

/**
 * Load permissions from database and store in memory
 */
const loadPermissions = async () => {
    try {
        const dbPermissions = await db.permissions.findAll({
            attributes: ["category", "title", "permissionId"],
            raw: true,
        });

        permissionCache = {};

        dbPermissions.forEach(({ category, title, permissionId }) => {
            if (!permissionCache[category]) {
                permissionCache[category] = {};
            }

            permissionCache[category][title] = permissionId;
        });

        logger.info("Permissions loaded into memory cache");
    } catch (error) {
        logger.error(`Permission cache load error: ${error.message}`);
    }
};

/**
 * Get permission id
 */
const getPermissionId = (category, title) => {
    return permissionCache?.[category]?.[title] || null;
};

/**
 * Get all permissions
 */
const getAllPermissions = () => permissionCache;

/**
 * Reload permissions
 */
const reloadPermissions = async () => {
    await loadPermissions();
};

module.exports = {
    loadPermissions,
    getPermissionId,
    getAllPermissions,
    reloadPermissions,
};