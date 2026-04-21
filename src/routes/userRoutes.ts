import express from "express";
import UserController from "../domain/user/user.seeds";
import protectRoute from "../middleware/authMiddleware";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

const router = express.Router();

// GET ALL USER
router.get("/", protectRoute, UserController.getAll);


//CREATE USER 
router.post("/",
    [protectRoute, upload.single("profilePic")],
    UserController.create,
);

//UPDATE USER
router.route("/:id").put(
    [protectRoute, upload.single("profilePic")],
    UserController.updateUser,
).delete(
    [protectRoute
    // , validateSchema(userSchema.delete), accessControl()
    ],
    UserController.deleteUser,
);

// // GET USER BY ID
router
  .route("/:id")
  .get(
    // [protected, validateSchema(userSchema.getById), accessControl()],
    UserController.getById,
  )
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
router
  .route("/multiple-delete")
  .post(
    [protectRoute, 
    // validateSchema(userSchema.multipleDelete), accessControl()
    ],
    UserController.deleteMany,
  );

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

// SET NEW PASSWORD
router
  .route("/new-password/:id")
  .post(
    // [validateSchema(userSchema.setNewPassword)],
    UserController.setNewPassword,
  );

// // RESET PASSWORD
router
  .route("/reset-password/:id")
  .put(
    // [validateSchema(userSchema.resetPassword)],
    UserController.resetPassword,
  );

// // FORGET PASSWORD
// router
//   .route("/forget-password")
//   .post(
//     [validateSchema(userSchema.forgetPassword)],
//     UserController.forgetPassword,
//   );

// POST auth/change-password :CHANGE PASSWORD
router
  .route("/change-password")
  .post(
    [protectRoute],
    UserController.changePassword,
  );

// POST auth/check-password : CHECK PASSWORD
router
  .route("/check-password")
  .post(
    [protectRoute],
    UserController.checkCurrentPassword,
  );

// // GET user/profile/me : GET PROFILE DATA
// router.route("/profile/me").get([protected], UserController.getProfile);

// GET ATTACHMENT
router.get("/attachment/:id", UserController.getAttachment);

export default router;
