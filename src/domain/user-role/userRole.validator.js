const yup = require("yup");
const db = require("../../models");
const { Op } = require("sequelize");
const { ADMIN_ROLE_ID } = require("../../constants/valueConstant");

const AssignedUserRoles = db.assigned_user_roles;
const UserRoles = db.user_roles;

const userRoleSchema = {
  // GET ALL USER ROLES
  getAll: yup.object({
    query: yup.object({
      SortByAscending: yup
        .string()
        .oneOf(["true", "false"], "Invalid value for SortByAscending.")
        .optional(),
      SortBy: yup
        .string()
        .oneOf(
          ["title", "description", "updatedAt"],
          "Invalid value for SortBy."
        )
        .optional(),
      Page: yup
        .number()
        .positive("Page must be a positive number.")
        .integer()
        .optional()
        .default(1),
      Limit: yup
        .number()
        .positive("Limit must be a positive number.")
        .max(100, "Limit cannot exceed 100.")
        .optional()
        .default(17),
      searchQuery: yup.string().optional(),
    }),
  }),

  // GET ROLE BY ID
  getById: yup.object({
    params: yup.object({
      id: yup
        .string()
        .uuid("Invalid user role ID.")
        .required("User role ID is required."),
    }),
  }),

  // CREATE USER ROLE
  create: yup.object({
    body: yup.object({
      title: yup
        .string()
        .required("Title is required.")
        .min(2, "Title must be at least 2 characters.")
        .max(50, "Title length should not be more than 50 characters."),
      description: yup
        .string()
        .required("Description is required.")
        .min(2, "Description must be at least 2 characters.")
        .max(230, "Description length should not be more than 200 characters."),
      levels: yup
        .array()
        .of(
          yup
            .number()
            .oneOf([1, 2, 3], "Invalid value for level.")
            .positive("Level must be a positive number.")
            .required("Level is required.")
        )
        .nullable()
        .notRequired(),
      apiIds: yup
        .array()
        .of(yup.string().uuid("Invalid Api ID."))
        .required("Ids are required."),
    }),
  }),

  // UPDATE USER ROLE
  update: yup.object({
    params: yup.object({
      id: yup
        .string()
        .uuid("Invalid user role ID.")
        .required("User role ID is required."),
    }),
    body: yup.object({
      title: yup
        .string()
        .required("Title is required.")
        .min(2, "Title must be at least 2 characters.")
        .max(50, "Title length should not be more than 50 characters."),
      description: yup
        .string()
        .required("Description is required.")
        .min(2, "Description must be at least 2 characters.")
        .max(230, "Description length should not be more than 200 characters."),
      levels: yup
        .array()
        .of(
          yup
            .number()
            .oneOf([1, 2, 3], "Invalid value for level.")
            .positive("Level must be a positive number.")
            .required("Level is required.")
        )
        .nullable()
        .notRequired(),
      apiIds: yup
        .array()
        .of(yup.string().uuid("Invalid Api ID."))
        .required("Ids are required."),
    }),
  }),

  // DELETE USER ROLE
  deleteOne: yup.object({
    params: yup.object({
      id: yup
        .string()
        .uuid("Invalid Role ID format.")
        .required("Role ID is required."),
    }),
  }),

  // DELETE MULTIPLE ROLES
  deleteMany: yup.object({
    body: yup.object({
      ids: yup
        .array()
        .of(yup.string().uuid("Invalid role ID."))
        .required("Ids are required.")
        .min(1, "At least one ID is required.")
        .test(
          "areNotAssigned",
          "One or more roles cannot be deleted as they are assigned to users.",
          async (ids) => {
            // Check if any role ID in the array is assigned to a user
            const assignedRoles = await AssignedUserRoles.findAll({
              where: {
                role_id: { [Op.in]: ids },
              },
              attributes: ["role_id"],
            });
            const assignedRoleIds = assignedRoles.map((role) => role.role_id);
            return assignedRoleIds.length === 0;
          }
        )
        .test(
          "areNotAdmin",
          "Access denied, Cannot delete the Admin role.",
          async (ids) => {
            // Check if any of the role IDs match ADMIN_ROLE_ID
            const adminRoles = await UserRoles.findAll({
              where: {
                roleId: {
                  [Op.in]: ids,
                },
              },
              attributes: ["roleId"],
            });

            const hasAdminRole = adminRoles.some(
              (role) => role.roleId === ADMIN_ROLE_ID
            );
            return !hasAdminRole;
          }
        ),
    }),
  }),

  // CHECK TITLE
  checkTitle: yup.object({
    body: yup.object({
      excludeId: yup.string().uuid("Invalid Role ID format.").optional(),

      title: yup
        .string()
        .required("Title is required.")
        .min(2, "Title must be at least 2 characters.")
        .max(50, "Title length should not be more than 50 characters."),
    }),
  }),
};

module.exports = userRoleSchema;
