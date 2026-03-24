import { Router } from "express";

import Auth from "../domain/general/authentication";
import UserController from "../domain/user/user.seeds";

const router = Router();

// USER LOGIN
router.post("/login", Auth.login);

// REFRESH TOKEN
router.post("/refresh", Auth.refreshToken);

// GET USER PROFILE
router.get("/me", Auth.checkAuthenticated);

// LOGOUT
router.post("/logout", Auth.logout);

// CHECK TEMPORARY PASSWORD
router.post(
  "/check-temp-password/:id",
  UserController.checkSecretKey
);

export default router;