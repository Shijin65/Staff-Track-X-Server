const db = require("../models");

/**
 *
 * @param {string} roleId - The role ID of the user.
 * @param {boolean} isSuperAdmin - A flag indicating whether the user is a super admin.
 * @returns {Promise<Object>} - A Promise that resolves to an object containing the permissions for each API endpoint.
 */
async function getPermissionsByRoleId(roleId, isSuperAdmin) {
  const Permission = {};
  const rolePermissions = db.role_permissions;
  const permissionName = db.permissions;

  if (!roleId && !isSuperAdmin) {
    throw new Error("Invalid roleId format or missing isSuperAdmin flag");
  }
  const AllPermissionNames = await permissionName.findAll({
    raw: true,
  });

  if (roleId && !isSuperAdmin) {
    const userRolePermissions = await rolePermissions.findAll({
      where: { roleId },
      attributes: ["apiId"],
      raw: true,
    });
    const apiIds = userRolePermissions.map((permission) => permission.apiId);

    const AvailablePermissions = AllPermissionNames.filter((permission) =>
      apiIds.includes(permission.apiId)
    );

    for (const api of AllPermissionNames) {
      const mergedNameWithoutSpaces = api.name.replace(/ /g, "");
      const isAccessAllowed = AvailablePermissions
        ? AvailablePermissions.some(
          (permission) => permission.apiId === api.apiId
        )
        : false;

      Permission[mergedNameWithoutSpaces] = isAccessAllowed;
    }
  } else if (isSuperAdmin) {
    // If the user is a super admin, grant all permissions
    for (const permission of AllPermissionNames) {
      const mergedNameWithoutSpaces = permission.title.replace(/ /g, "");
      Permission[mergedNameWithoutSpaces] = true;
    }
  }
  return Permission;
}

module.exports = getPermissionsByRoleId;
