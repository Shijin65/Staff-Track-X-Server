import express from "express";
import UserController from "../domain/user/user.seeds";
import protectRoute from "../middleware/authMiddleware";

const router = express.Router();

// GET ALL USER
router.get("/", protectRoute, UserController.getAll);


//CREATE USER 
// .post(
//   [validateSchema(userSchema.create), accessControl()],
//   UserController.create,
// );

// // GET USER BY ID
// router
//   .route("/:id")
//   .get(
//     [protected, validateSchema(userSchema.getById), accessControl()],
//     UserController.getById,
//   )
//   // UPDATE USER
//   .put(
//     [protected, validateSchema(userSchema.update), accessControl()],
//     UserController.updateUser,
//   )
//   //USER DELETE
//   .delete(
//     [protected, validateSchema(userSchema.delete), accessControl()],
//     UserController.deleteOne,
//   );

// // MULTIPLE DELETE
// router
//   .route("/multiple-delete")
//   .post(
//     [protected, validateSchema(userSchema.multipleDelete), accessControl()],
//     UserController.deleteMany,
//   );

// //CHECK EMAIL
// router
//   .route("/check-email")
//   .post(
//     [protected, validateSchema(userSchema.checkEmail), accessControl()],
//     UserController.checkEmail,
//   );

// // GET USER BY ID WITH PERMISSION
// router
//   .route("/permission/:id")
//   .get(
//     [protected, validateSchema(userSchema.getById), accessControl()],
//     UserController.getPermissionById,
//   );

// // SET NEW PASSWORD
// router
//   .route("/new-password/:id")
//   .post(
//     [validateSchema(userSchema.setNewPassword)],
//     UserController.setNewPassword,
//   );

// // RESET PASSWORD
// router
//   .route("/reset-password/:id")
//   .put(
//     [validateSchema(userSchema.resetPassword)],
//     UserController.resetPassword,
//   );

// // FORGET PASSWORD
// router
//   .route("/forget-password")
//   .post(
//     [validateSchema(userSchema.forgetPassword)],
//     UserController.forgetPassword,
//   );

// // POST auth/change-password :CHANGE PASSWORD
// router
//   .route("/change-password")
//   .post(
//     [protected, validateSchema(userSchema.changePassword)],
//     UserController.changePassword,
//   );

// // POST auth/check-password : CHECK PASSWORD
// router
//   .route("/check-password")
//   .post(
//     [protected, validateSchema(userSchema.checkCurrentPassword)],
//     UserController.checkCurrentPassword,
//   );

// // GET user/profile/me : GET PROFILE DATA
// router.route("/profile/me").get([protected], UserController.getProfile);

// // PUT user/profile/me : UPDATE PROFILE DATA
// router
//   .route("/profile/me")
//   .put(
//     [protected, validateSchema(userSchema.updateProfile)],
//     UserController.updateUserProfile,
//   );

export default router;
