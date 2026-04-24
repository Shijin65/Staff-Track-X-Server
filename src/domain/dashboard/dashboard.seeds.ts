import { Request, Response } from "express";
import { asyncHandler } from "../../middleware";
import { ApiResponse, getPermissionsByRoleId, getUserRole } from "../../utils";
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
      const role = getUserRole(roleId);
      const isSupervisor = role?.name == "Supervisor";
      const summary: any = {};

      // 1. Events and Active/Confirmed Events count
      if (permissions[PERMISSIONS.VIEW_EVENT]) {
        summary.totalEvents = await Event.count();

        summary.cancelledEvents = await Event.count({
          where: { status: "Cancelled" }
        });

        summary.activeEvents = await Event.count({
          where: { status: "Confirmed" }
        });
      }

      // 2. Total Users/Staff Count (Conditional)
      if (permissions[PERMISSIONS.VIEW_USER]) {
        summary.totalStaff = await User.count({
          where: { isSuperAdmin: false }
        });
      }

      // 3. Pending Applications Count (Conditional)
      if (permissions[PERMISSIONS.VIEW_EVENT] || isSuperAdmin) {
        summary.pendingApps = await EventRequest.count({
          where: { status: "pending" }
        });
      }

      // 4. User Specific Stats (USER SPECIFIC)
      if (!isSuperAdmin || isSupervisor) {
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
