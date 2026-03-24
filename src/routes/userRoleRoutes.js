// const express = require("express");
// const protected = require("../middleware/authMiddleware");
// const UserRoleController = require("../domain/user-role/userRole.seeds");
// const RolePermissionController = require("../domain/user-role/rolePermission.seeds");
// const accessControl = require("../middleware/accessControlMiddleware");
// const validateSchema = require("../middleware/validationMiddleware");
// const userRoleSchema = require("../domain/user-role/userRole.validator");
// const rolePermissionSchema = require("../domain/user-role/rolePermission.validator");

// const router = express.Router();

// // GET ALL USER ROLES
// router
//   .route("/")
//   .get(
//     [protected, validateSchema(userRoleSchema.getAll), accessControl()],
//     UserRoleController.getAll,
//   )
//   // CREATE USER ROLE WITH PERMISSIONS
//   .post(
//     [protected, validateSchema(userRoleSchema.create), accessControl()],
//     UserRoleController.create,
//   );

// // GET ROLE BY ID
// router
//   .route("/:id")
//   .get(
//     [protected, validateSchema(userRoleSchema.getById), accessControl()],
//     UserRoleController.getById,
//   )
//   // UPDATE USER ROLE WITH PERMISSIONS
//   .put(
//     [protected, validateSchema(userRoleSchema.update), accessControl()],
//     UserRoleController.update,
//   )
//   // DELETE USER ROLE
//   .delete(
//     [protected, validateSchema(userRoleSchema.deleteOne), accessControl()],
//     UserRoleController.deleteOne,
//   );

// // DELETE MULTIPLE ROLES
// router
//   .route("/multiple-delete")
//   .post(
//     [protected, validateSchema(userRoleSchema.deleteMany), accessControl()],
//     UserRoleController.deleteMany,
//   );

// // CHECK TITLE
// router
//   .route("/check-title")
//   .post(
//     [protected, validateSchema(userRoleSchema.checkTitle), accessControl()],
//     UserRoleController.checkTitle,
//   );

// // GET ALL BASE PERMISSIONS
// router
//   .route("/base/permissions")
//   .get([protected, accessControl()], RolePermissionController.getAllBase);

// // GET PERMISSIONS BY ID FOR A ROLE
// router
//   .route("/permission/:id")
//   .get(
//     [protected, validateSchema(rolePermissionSchema.getById), accessControl()],
//     RolePermissionController.getPermissionById,
//   );

// module.exports = router;
