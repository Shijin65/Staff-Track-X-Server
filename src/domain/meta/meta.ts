
import { Request, Response } from "express";
import { asyncHandler } from "../../middleware";
import { ApiResponse } from "../../utils";
import { ROLES } from "../../utils/rolePermissionMap";
import { SUPER_ADMIN_ROLE_ID } from "../../constants/valueConstant";

class MetaController {
  /**
   * Get all available routes and their permissions
   */
  static getRolePermissions = asyncHandler(async (req: Request, res: Response) => {
    return res.json(
      new ApiResponse(200, "Roles and route permissions fetched successfully", {
        roles: Object.values(ROLES).filter((role) => role.roleId !== SUPER_ADMIN_ROLE_ID),
      })
    );
  });
}

export default MetaController;
