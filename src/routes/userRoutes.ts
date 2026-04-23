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
    [protectRoute],
    UserController.getById,
  )

// // MULTIPLE DELETE
router
  .route("/multiple-delete")
  .post(
    [protectRoute],
    UserController.deleteMany,
  );

// SET NEW PASSWORD
router
  .route("/new-password/:id")
  .post(
    UserController.setNewPassword,
  );

// // RESET PASSWORD
router
  .route("/reset-password/:id")
  .put(
    // [validateSchema(userSchema.resetPassword)],
    UserController.resetPassword,
  );


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
