import { Router } from "express";
import DashboardController from "../domain/dashboard/dashboard.seeds";
import protectRoute from "../middleware/authMiddleware";

const router = Router();

// Get dashboard summary counts
router.get("/summary", protectRoute, DashboardController.getSummary);

export default router;
