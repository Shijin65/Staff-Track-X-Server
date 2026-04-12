
import { Router } from "express";
import MetaController from "../domain/meta/meta";
import protectRoute from "../middleware/authMiddleware";

const router = Router();

// GET all available routes and their permissions
router.get("/roles", protectRoute, MetaController.getRolePermissions);

export default router;
