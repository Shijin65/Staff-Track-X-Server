const { Op } = require("sequelize");
const Sequelize = require("sequelize");
const { asyncHandler } = require("../../middleware");
const db = require("../../models");
const { ApiResponse, redisStore } = require("../../utils");
const {
  SUPER_ADMIN_ROLE_ID,
  ADMIN_ROLE_ID,
} = require("../../constants/valueConstant");
const { logger } = require("../../config/loggerConfig");

const User = db.users;
const UserRoles = db.user_roles;
const RolePermission = db.role_permissions;
const AssignedUserRoles = db.assigned_user_roles;
const PermissionName = db.api_names;

class UserRoleController {
  // GET ALL USER ROLES         ///////////////////////////////////////
  static getAll = asyncHandler(async (req, res) => {
    try {
      const { SortByAscending, SortBy, Page, Limit, SearchQuery } = req.query;
      const sortDirection = SortByAscending === "true" ? "ASC" : "DESC";
      const skip = (parseInt(Page) - 1) * parseInt(Limit);

      const query = {};

      if (SearchQuery && SearchQuery.trim().length > 0) {
        const regex = `%${SearchQuery}%`; // Sequelize uses '%' for LIKE instead of regex
        query[Op.or] = [
          { title: { [Op.iLike]: regex } },
          { description: { [Op.iLike]: regex } },
        ];
      }

      // Retrieve data count from the database
      const totalCount = await UserRoles.count({
        where: {
          ...query,
          roleId: {
            [Op.ne]: SUPER_ADMIN_ROLE_ID,
          },
        },
      });

      const totalPages = Math.ceil(totalCount / parseInt(Limit));

      const options = {
        where: {
          ...query,
          roleId: {
            [Op.ne]: SUPER_ADMIN_ROLE_ID,
          },
        },
        raw: true,
        limit: parseInt(Limit) || null,
        offset: skip || 0,
        collation: { locale: "en" },
        order: [
          [
            Sequelize.literal(
              `CASE WHEN role_id = '${ADMIN_ROLE_ID}' THEN 0 ELSE 1 END`,
            ),
            "ASC",
          ],
          ...(SortBy && sortDirection ? [[SortBy, sortDirection]] : []),
        ],
      };

      const userRoles = await UserRoles.findAll(options);
      const metaData = {
        totalPages,
        totalCount,
        itemCount: userRoles.length || 0,
      };
      res.json(new ApiResponse(200, "Success", userRoles, metaData));
    } catch (error) {
      logger.error(`Failed to retrieve user roles:  ${error?.message}`);
      res
        .status(400)
        .json(new ApiResponse(400, "Failed to retrieving user roles."));
    }
  });

  // GET ROLE BY ID            ///////////////////////////////////////
  static getById = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;

      const userRole = await UserRoles.findByPk(id, {
        attributes: ["title", "description", "levels"],
      });

      if (!userRole) {
        return res
          .status(404)
          .json(new ApiResponse(404, "User Role not found."));
      }

      const apiPermissionData = await PermissionName.findAll({
        raw: true,
        attributes: ["name", "category", "apiId"],
      });

      const allUserRolePermission = await RolePermission.findAll({
        where: { roleId: id },
        attributes: ["apiId"],
        raw: true,
      });

      const userRolePermission = allUserRolePermission.map(
        (permission) => permission.apiId,
      );

      const updatedApis = apiPermissionData.map((api) => ({
        ...api,
        is_access: userRolePermission.includes(api.apiId),
      }));

      const resData = {
        title: userRole.title,
        description: userRole.description,
        levels: userRole.levels,
        permissions: updatedApis,
        resourceId: userRolePermission.length > 0 ? userRolePermission : [],
      };

      res.json(new ApiResponse(200, "Success", resData));
    } catch (error) {
      logger.error(`Failed to retrieve user role: ${error.message}`, {
        stack: error.stack,
      });
      res
        .status(400)
        .json(new ApiResponse(400, "Failed to retrieving user role."));
    }
  });

  // CREATE USER ROLES         ///////////////////////////////////////
  static create = asyncHandler(async (req, res) => {
    try {
      const { title, description, levels, apiIds } = req.body;
      const user = req.user;
      const ArrayLevels = Array.isArray(levels) ? levels : [levels];
      const apiPermissionData = await redisStore.getAll();

      const newUserRole = await UserRoles.create({
        title,
        description,
        levels: ArrayLevels,
        createdBy: user.userId,
      });

      if (newUserRole) {
        const roleId = newUserRole.dataValues.roleId;

        if (apiIds && apiIds.length > 0) {
          const updatedApiIds = await ensureRequiredPermissions(
            apiIds,
            [],
            apiPermissionData,
          );
          const uniqueApiIds = [...new Set(updatedApiIds)];
          const permissionData = uniqueApiIds.map((apiId) => ({
            roleId: roleId,
            apiId: apiId,
            createdBy: user.userId,
            updatedAt: Date.now(),
            createdAt: Date.now(),
          }));

          await RolePermission.bulkCreate(permissionData, { returning: true });
        }
        return res.status(201).json(new ApiResponse(201));
      }
    } catch (error) {
      logger.error(`Failed to create user role:  ${error?.message}`);
      res.status(400).json(new ApiResponse(400, "Failed to create role."));
    }
  });

  //CHECK THE TITLE ON CHANGE   ///////////////////////////////////////
  static checkTitle = asyncHandler(async (req, res) => {
    try {
      const { title, excludeId } = req.body;
      const whereCondition = {
        [Sequelize.Op.and]: [
          Sequelize.where(
            Sequelize.fn("LOWER", Sequelize.col("title")),
            title.toLowerCase(),
          ),
        ],
      };

      if (excludeId) {
        whereCondition[Sequelize.Op.and].push({
          role_id: { [Sequelize.Op.ne]: excludeId },
        });
      }

      const roleTitle = await UserRoles.findOne({
        where: whereCondition,
      });
      if (roleTitle) {
        return res.json(new ApiResponse(200, "Title already exists!."));
      } else {
        return res
          .status(204)
          .json(new ApiResponse(200, "Title does not exist."));
      }
    } catch (error) {
      logger.error(`Failed to check role title:  ${error?.message}`);
      res.status(400).json(new ApiResponse(400, "Failed to check Role Title."));
    }
  });

  //UPDATE USER ROLE            ///////////////////////////////////////
  static update = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, levels, apiIds } = req.body;
      const user = req.user;
      const userRole = await UserRoles.findByPk(id);
      const apiPermissionData = await redisStore.getAll();

      if (!userRole) {
        return res
          .status(404)
          .json(new ApiResponse(404, "UserRole not found."));
      }

      Object.assign(userRole, {
        title,
        description,
        levels,
        createdBy: user.userId,
        updatedAt: Date.now(),
      });
      const updatedUserRole = await userRole.save();
      const roleId = updatedUserRole.roleId;

      const resData = {
        roleId: updatedUserRole.roleId,
        title: updatedUserRole.title,
        description: updatedUserRole.description,
        level: updatedUserRole.level,
        createdAt: updatedUserRole.createdAt,
        updatedAt: updatedUserRole.updatedAt,
      };

      // update role permissions

      const existingPermissions = await RolePermission.findAll({
        where: { role_id: roleId },
        attributes: ["api_id"],
        raw: true,
      });

      const existingApiIds = new Set(
        existingPermissions.map((perm) => perm.api_id),
      );

      // Return early if no changes
      if (
        apiIds.length === existingApiIds.size &&
        apiIds.every((id) => existingApiIds.has(id))
      ) {
        return res.json(
          new ApiResponse(
            200,
            "Role and permissions updated successfully.",
            resData,
          ),
        );
      }

      const { toAdd, toRemove } = calculatePermissionChanges(
        apiIds,
        existingApiIds,
        apiPermissionData,
      );

      const updatedApiIds = await ensureRequiredPermissions(
        toAdd,
        existingApiIds,
        apiPermissionData,
      );

      await updateRolePermissions(
        roleId,
        toAdd,
        toRemove,
        updatedApiIds,
        user.userId,
      );

      await invalidateUserTokens(roleId);

      res.json(
        new ApiResponse(
          200,
          "The role has been updated successfully.",
          resData,
        ),
      );
    } catch (error) {
      logger.error(`Failed to update user role:  ${error?.message}`);
      res.status(400).json(new ApiResponse(400, "Failed to update User Role."));
    }
  });

  //DELETE MULTIPLE ROLES       ///////////////////////////////////////
  static deleteMany = asyncHandler(async (req, res) => {
    try {
      const { ids } = req.body;
      const userRoles = await UserRoles.findAll({
        where: {
          role_id: { [Op.in]: ids },
        },
        raw: true,
      });

      if (!userRoles || userRoles.length === 0) {
        return res
          .status(404)
          .json(new ApiResponse(404, "User Role(s) Not Found."));
      }
      await UserRoles.destroy({
        where: {
          role_id: { [Op.in]: ids },
        },
      });

      return res.json(new ApiResponse(200, "User Role(s) Removed."));
    } catch (error) {
      logger.error(`Failed to delete user roles:  ${error?.message}`);
      res.status(400).json(new ApiResponse(400, "Failed to Delete Roles."));
    }
  });

  // DELETE ROLE                ///////////////////////////////////////
  static deleteOne = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;

      // Check if role exists
      const userRole = await UserRoles.findByPk(id);
      if (!userRole) {
        return res
          .status(404)
          .json(new ApiResponse(404, "User Role not found."));
      }

      // Prevent deletion of Admin role
      if (userRole.role_id === ADMIN_ROLE_ID) {
        return res
          .status(403)
          .json(
            new ApiResponse(
              403,
              "Access denied, Cannot delete the Admin role.",
            ),
          );
      }

      // Prevent deletion if role assigned to a user
      const assignedUser = await AssignedUserRoles.findOne({
        where: { role_id: id },
      });
      if (assignedUser) {
        return res
          .status(403)
          .json(
            new ApiResponse(
              403,
              "Cannot delete this role as it is already assigned to a user.",
            ),
          );
      }

      // Delete role
      await UserRoles.destroy({ where: { role_id: id } });

      return res.json(new ApiResponse(200, "User Role Removed."));
    } catch (error) {
      logger.error(`Failed to delete user role: ${error?.message}`);
      return res
        .status(400)
        .json(new ApiResponse(400, "Failed to Delete Role."));
    }
  });
}

module.exports = UserRoleController;

// Helper functions
const calculatePermissionChanges = (
  apiIds,
  existingApiIds,
  apiPermissionData,
) => {
  const uniqueApiIds = new Set(apiIds);

  const toAdd = [...uniqueApiIds].filter((id) => !existingApiIds.has(id));

  const toRemove = Array.from(existingApiIds).filter((id) => {
    if (uniqueApiIds.has(id)) return false;

    const api = apiPermissionData.find((item) => item.apiId === id);
    if (!api) return true;

    const isViewPermission = api.name === `View ${api.category}`;
    if (!isViewPermission) return true;

    const categoryStillHasPermissions = [...uniqueApiIds].some((otherId) => {
      const other = apiPermissionData.find((item) => item.apiId === otherId);
      return other && other.category === api.category && otherId !== id;
    });

    return !categoryStillHasPermissions;
  });

  return { toAdd, toRemove };
};

const ensureRequiredPermissions = async (
  toAdd,
  existingApiIds,
  apiPermissionData,
) => {
  const requiredApis = [
    "View Search",
    "View Guest",
    "View Production",
    "View Episode",
    "View Report",
    "View Rundown",
  ];
  
  const categories = categorizePermissions(toAdd, apiPermissionData);

  const updatedApiIds = new Set([...existingApiIds, ...toAdd]);
  requiredApis.forEach((requiredApi) => {
    for (const category in categories) {
      const exists = categories[category].some(
        (api) => api.name === requiredApi,
      );
      if (!exists) {
        const viewApi = apiPermissionData.find(
          (api) => api.category === category && api.name === requiredApi,
        );
        if (viewApi) {
          updatedApiIds.add(viewApi.apiId);
        }
      }
    }
  });

  return updatedApiIds;
};

const categorizePermissions = (toAdd, apiPermissionData) => {
  return toAdd.reduce((acc, id) => {
    const api = apiPermissionData.find((item) => item.apiId === id);
    if (!api) {
      throw new ApiResponse(404, `API with id: '${id}' not found.`);
    }
    if (!acc[api.category]) acc[api.category] = [];
    acc[api.category].push(api);
    return acc;
  }, {});
};

const updateRolePermissions = async (
  roleId,
  toAdd,
  toRemove,
  updatedApiIds,
  userId,
) => {
  const rolePermissionsData = Array.from(updatedApiIds).map((apiId) => ({
    roleId,
    apiId,
    createdBy: userId,
    updatedAt: Date.now(),
    createdAt: Date.now(),
  }));

  if (toRemove.length > 0) {
    await RolePermission.destroy({ where: { roleId, apiId: toRemove } });
  }

  if (toAdd.length > 0) {
    await RolePermission.bulkCreate(rolePermissionsData, { returning: true });
  }
};

const invalidateUserTokens = async (roleId) => {
  const affectedUsers = await AssignedUserRoles.findAll({
    where: { roleId },
    attributes: ["user_id"],
    raw: true,
  });

  const userIds = [...new Set(affectedUsers.map((ur) => ur.user_id))];
  if (userIds.length > 0) {
    await User.update(
      { tokenInvalidDateTime: new Date() },
      { where: { userId: userIds } },
    );
  }
};
