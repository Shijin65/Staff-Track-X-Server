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

      if (isUpcoming === "true") {
        const userId = (req as any).user?.userId;
        if (userId) {
          const requestedEvents = await EventRequest.findAll({
            where: { userId },
            attributes: ["eventId"],
          });
          const requestedEventIds = requestedEvents.map((req: any) => req.eventId);

          if (requestedEventIds.length > 0) {
            whereClause.eventId = {
              [Op.notIn]: requestedEventIds,
            };
          }
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        whereClause.eventDate = {
          ...whereClause.eventDate,
          [Op.gte]: today,
        };
      }

      const count = await Event.count({ where: whereClause });
      const rows = await Event.findAll({
        where: whereClause,
        limit,
        offset,
        order: [["eventDate", "DESC"]],
        include: [
          {
            model: EventStaffRequirements,
            as: "staffRequirements",
          },
          {
            model: EventRequest,
            as: "eventRequests",
          },
        ],
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
}

export default EventController;
