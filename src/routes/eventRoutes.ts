import { Router } from "express";
import EventController from "../domain/event/event.seeds";
import protectRoute from "../middleware/authMiddleware";

const router = Router();

router.get("/", protectRoute, EventController.getAll);
router.post("/", protectRoute, EventController.create);
router.get("/:id", protectRoute, EventController.getById);
router.put("/:id", protectRoute, EventController.update);
router.delete("/:id", protectRoute, EventController.delete);

export default router;
