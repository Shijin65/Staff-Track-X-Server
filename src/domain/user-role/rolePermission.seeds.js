const { asyncHandler } = require("../../middleware");
const { ApiResponse } = require("../../utils");
const db = require("../../models");
const { logger } = require("../../config/loggerConfig");

const RolePermission = db.role_permissions;
const PermissionName = db.api_names;

class RolePermissionController {
  // GET ALL BASE PERMISSIONS ///////////////////////////////////////
  static getAllBase = asyncHandler(async (req, res) => {
    try {
      const apiPermissionData = await PermissionName.findAll({
        raw: true,
        attributes: ["name", "category", "apiId"],
      });

      const mappedPermissions = apiPermissionData.map((api) => ({
        ...api,
        is_access: false,
      }));

      const resData = {
        data: mappedPermissions,
        resourceId: [],
      };

      res.json(new ApiResponse(200, "Success", resData));
    } catch (error) {
      logger.error(`Error in getting all base permissions:  ${error?.message}`);
      res.status(400).json(new ApiResponse(400, "Failed to get permission."));
    }
  });

  // GET PERMISSIONS BY ID ///////////////////////////////////////
  static getPermissionById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const apiPermissionData = await PermissionName.findAll({
        raw: true,
        attributes: ["name", "category", "apiId"],
      });

      const allUserRolePermission = await RolePermission.findAll({
        where: {
          roleId: id,
        },
        attributes: ["apiId"],
        raw: true,
      });

      const userRolePermission = allUserRolePermission.map(
        (permission) => permission.apiId
      );

      const updatedApis = apiPermissionData.map((api) => ({
        ...api,
        is_access: userRolePermission?.includes(api.apiId) || false,
      }));

      const resData = {
        data: updatedApis,
        resourceId: userRolePermission ? userRolePermission : [],
      };
      res.json(new ApiResponse(200, "Success", resData));
    } catch (error) {
      logger.error(`Error in getting all base permissions:  ${error?.message}`);
      res.status(400).json(new ApiResponse(400, "Failed to get permission."));
    }
  });
}
module.exports = RolePermissionController;
