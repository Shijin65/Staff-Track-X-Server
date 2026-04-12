import { Request, Response } from "express";
import { asyncHandler } from "../../middleware";
import { ApiResponse } from "../../utils";
const db = require("../../models");
const Event = db.events;
const { Op } = require("sequelize");

class EventController {
  // CREATE EVENT
  static create = asyncHandler(async (req: Request, res: Response) => {
    const event = await Event.create(req.body);
    return res.status(201).json(new ApiResponse(201, "Event created successfully.", event));
  });

  // GET ALL EVENTS
  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const { Page = 1, Limit = 10, SearchQuery = "" } = req.query;
    const page = parseInt(Page as string);
    const limit = parseInt(Limit as string);
    const offset = (page - 1) * limit;

    const whereClause: any = {};
    if (SearchQuery) {
      whereClause.title = { [Op.iLike]: `%${SearchQuery}%` };
    }

    const { count, rows } = await Event.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["eventDate", "DESC"]],
    });

    return res.json(
      new ApiResponse(200, "Events fetched successfully.", rows, {
        totalCount: count,
        totalPages: Math.ceil(count / limit),
      })
    );
  });

  // GET EVENT BY ID
  static getById = asyncHandler(async (req: Request, res: Response) => {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json(new ApiResponse(404, "Event not found."));
    return res.json(new ApiResponse(200, "Success.", event));
  });

  // UPDATE EVENT
  static update = asyncHandler(async (req: Request, res: Response) => {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json(new ApiResponse(404, "Event not found."));
    await event.update(req.body);
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
