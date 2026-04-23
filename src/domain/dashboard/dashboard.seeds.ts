import { Request, Response } from "express";
import { asyncHandler } from "../../middleware";
import { ApiResponse, getPermissionsByRoleId } from "../../utils";
import PERMISSIONS from "../../constants/Permissions";
const db = require("../../models");
const Event = db.events;
const User = db.users;
const EventRequest = db.event_requests;
const { Op } = require("sequelize");

class DashboardController {
  static getSummary = asyncHandler(async (req: Request, res: Response) => {
    try {
      const { userId, roleId, isSuperAdmin } = (req as any).user;
      const permissions = getPermissionsByRoleId(roleId, isSuperAdmin);

      const summary: any = {};

      // 1. Events Count
      summary.totalEvents = await Event.count({
        where: { status: { [Op.ne]: "Cancelled" } }
      });

      // 2. Active/Confirmed Events Count
      summary.activeEvents = await Event.count({
        where: { status: "Confirmed" }
      });

      // 3. Total Users/Staff Count (Conditional)
      if (permissions[PERMISSIONS.VIEW_USER]) {
        summary.totalStaff = await User.count({
          where: { isSuperAdmin: false }
        });
      }

      // 4. Pending Applications Count (Conditional)
      // Usually only admins/supervisors see this
      if (permissions[PERMISSIONS.UPDATE_EVENT] || isSuperAdmin) {
        summary.pendingApps = await EventRequest.count({
          where: { status: "pending" }
        });
      }

      // 5. User Specific Stats
      if (!isSuperAdmin) {
        summary.applied = await EventRequest.count({
          where: { userId }
        });

        summary.approved = await EventRequest.count({
          where: { userId, status: "Approved" }
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        summary.upcoming = await Event.count({
            where: {
                eventDate: { [Op.gte]: today },
                status: { [Op.ne]: "Cancelled" }
            }
        });
      }

      return res.json(new ApiResponse(200, "Dashboard summary fetched successfully.", summary));
    } catch (error) {
      console.error(error);
      return res.status(500).json(new ApiResponse(500, "Failed to fetch dashboard summary.", error));
    }
  });
}

export default DashboardController;
