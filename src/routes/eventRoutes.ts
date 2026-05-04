import { Router } from "express";
import EventController from "../domain/event/event.seeds";
import protectRoute from "../middleware/authMiddleware";

const router = Router();

/**
* EVENT REQUESTS
**/

// Get all events
router.get("/", protectRoute, EventController.getAll);

// Get high demand events
router.get("/high-demand", protectRoute, EventController.getHighDemand);

// Create event
router.post("/", protectRoute, EventController.create);

// Get available events for user
router.get("/available", protectRoute, EventController.getAvailableForUser);

// Get single event
router.get("/:eventId", protectRoute, EventController.getById);

// Get event requirements
router.get("/:eventId/requirements", protectRoute, EventController.getEventRequirements);

// Get event attendance details
router.get("/:eventId/attendance", protectRoute, EventController.getAttendanceDetails);

// Update event
router.put("/:eventId", protectRoute, EventController.update);

// Delete event
router.delete("/:eventId", protectRoute, EventController.delete);

// Multiple delete
router.post("/multiple-delete", protectRoute, EventController.deleteMany);


/**
 * EVENT APPLICATIONS
**/

// Apply to event
router.post("/:eventId/applications", protectRoute, EventController.apply); 

// My applications
router.get("/applications/me", protectRoute, EventController.getMyRequests); 

// Approve/Reject
router.put("/applications/:applicationId", protectRoute, EventController.updateRequestStatus); 

// Get event applications
router.get("/:eventId/applications", protectRoute, EventController.getApplicationsByEvent);

export default router;