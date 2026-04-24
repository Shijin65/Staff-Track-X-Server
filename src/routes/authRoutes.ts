import { Router } from "express";

import Auth from "../domain/auth/authentication";
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

// FORGOT PASSWORD
router.post("/forgot-password", Auth.forgotPassword);

// CHECK TEMPORARY PASSWORD
router.post("/check-temp-password/:id", UserController.checkSecretKey);

// CHECK OTP
router.post("/check-otp", Auth.verifyOtp);



export default router;