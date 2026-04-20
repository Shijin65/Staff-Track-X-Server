import { Request, Response } from "express";
import { asyncHandler } from "../../middleware";
import { ApiResponse } from "../../utils";
const db = require("../../models");
const Event = db.events;
const EventStaffRequirements = db.event_staff_requirements;
const EventRequest = db.event_requests;
const { Op } = require("sequelize");

class EventController {
  // CREATE EVENT
  static create = asyncHandler(async (req: Request, res: Response) => {
    try {
      const event = await Event.create(req.body);
      if (req.body.staffRequirements) {
        const reqs = req.body.staffRequirements.map((r: any) => ({ ...r, eventId: event.eventId }));
        await EventStaffRequirements.bulkCreate(reqs);
      }
      return res.status(201).json(new ApiResponse(201, "Event created successfully.", event));
    } catch (error) {
      console.log(error);
      return res.status(500).json(new ApiResponse(500, "Failed to create event.", error));
    }
  });

  // GET ALL EVENTS
  static getAll = asyncHandler(async (req: Request, res: Response) => {
    try {
      const {
        Page = 1,
        Limit = 10,
        SearchQuery = "",
        isUpcoming } = req.query;

      const page = parseInt(Page as string) || 1;
      let limit = parseInt(Limit as string) || 10;

      const MAX_LIMIT = 100;
      if (limit > MAX_LIMIT) limit = MAX_LIMIT;

      const offset = (page - 1) * limit;

      const whereClause: any = {};
      if (SearchQuery) {
        whereClause.title = { [Op.iLike]: `%${SearchQuery}%` };
      }

      const includeClause: any[] = [
        {
          model: EventStaffRequirements,
          as: "staffRequirements",
        },
      ];

      if (isUpcoming === "true") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        whereClause.eventDate = { [Op.gte]: today };
        whereClause.status = { [Op.ne]: "Cancelled" };

        const userId = (req as any).user?.userId;
        if (userId) {
          includeClause.push({
            model: EventRequest,
            as: "eventRequests",
            required: false,
            attributes: [],
            where: { userId },
          });
          whereClause["$eventRequests.request_id$"] = { [Op.is]: null };
        }
      }
      
      const { count, rows } = await Event.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [["eventDate", "DESC"]],
        include: includeClause,
        distinct: true,
        subQuery: false,
      });

      return res.json(
        new ApiResponse(200, "Events fetched successfully.", rows, {
          totalCount: count,
          totalPages: Math.ceil(count / limit),
          itemCount: rows.length,
        })
      );
    } catch (error) {
      console.log(error);
      return res.status(500).json(new ApiResponse(500, "Failed to fetch events.", error));
    }
  });

  // GET EVENT BY ID
  static getById = asyncHandler(async (req: Request, res: Response) => {
    const event = await Event.findByPk(req.params.id, {
      include: [
        {
          model: EventStaffRequirements,
          as: "staffRequirements",
        },
        {
          model: EventRequest,
          as: "eventRequests",
          include: [{ model: db.users, as: "user", attributes: ["userId", "firstName", "lastName", "mobileNumber", "email"] }],
        },
      ],
    });
    if (!event) return res.status(404).json(new ApiResponse(404, "Event not found."));
    return res.json(new ApiResponse(200, "Success.", event));
  });

  // UPDATE EVENT
  static update = asyncHandler(async (req: Request, res: Response) => {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json(new ApiResponse(404, "Event not found."));

    await event.update(req.body);

    if (req.body.staffRequirements) {
      await db.event_staff_requirements.destroy({ where: { event_id: event.eventId } });
      const reqs = req.body.staffRequirements.map((r: any) => ({ ...r, eventId: event.eventId }));
      await db.event_staff_requirements.bulkCreate(reqs);
    }

    return res.json(new ApiResponse(200, "Event updated successfully.", event));
  });

  // DELETE EVENT
  static delete = asyncHandler(async (req: Request, res: Response) => {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json(new ApiResponse(404, "Event not found."));
    await event.destroy();
    return res.json(new ApiResponse(200, "Event deleted successfully."));
  });

  // APPLY FOR EVENT
  static apply = asyncHandler(async (req: Request, res: Response) => {
    try {
      const { id: eventId } = req.params;
      const { roleId } = req.body;
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json(new ApiResponse(401, "User not authenticated."));
      }

      // Check if event exists
      const event = await Event.findByPk(eventId);
      if (!event) {
        return res.status(404).json(new ApiResponse(404, "Event not found."));
      }

      // Check if already applied
      const existingRequest = await EventRequest.findOne({
        where: { eventId, userId }
      });

      if (existingRequest) {
        return res.status(400).json(new ApiResponse(400, "You have already applied for this event."));
      }

      const request = await EventRequest.create({
        eventId,
        userId,
        roleId: roleId || null,
        status: "pending",
        appliedAt: new Date(),
      });

      return res.status(201).json(new ApiResponse(201, "Application submitted successfully.", request));
    } catch (error) {
      console.log(error);
      return res.status(500).json(new ApiResponse(500, "Failed to submit application.", error));
    }
  });

  // GET MY REQUESTS
  static getMyRequests = asyncHandler(async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json(new ApiResponse(401, "User not authenticated."));
      }

      const requests = await EventRequest.findAll({
        where: { userId },
        include: [
          {
            model: Event,
            as: "event",
            attributes: ["eventId", "title", "eventDate", "eventVenue", "reportingTime", "startTime", "eventType", "city", "district", "status"],
          },
        ],
        order: [["appliedAt", "DESC"]],
      });

      return res.json(new ApiResponse(200, "My requests fetched successfully.", requests));
    } catch (error) {
      console.log(error);
      return res.status(500).json(new ApiResponse(500, "Failed to fetch my requests.", error));
    }
  });
}

export default EventController;
