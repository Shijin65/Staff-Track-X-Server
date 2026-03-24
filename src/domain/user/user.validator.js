const yup = require("yup");
const db = require("../../models");
const { phoneRegExp } = require("../../utils/regex");
const User = db.users;

const userSchema = {
  getAll: yup.object({
    query: yup.object({
      SortByAscending: yup
        .string()
        .oneOf(["true", "false"], "Invalid value for SortByAscending.")
        .optional(),
      SortBy: yup
        .string()
        .oneOf(
          [
            "fullName",
            "email",
            "status",
            "productions",
            "roles",
            "updatedAt",
            "createdAt",
          ],
          "Invalid value for SortBy."
        )
        .optional(),
      Page: yup
        .number()
        .positive("Page must be a positive number.")
        .integer("Page must be a `number` type.")
        .optional()
        .default(1),
      Limit: yup
        .number()
        .positive("Limit must be a positive number.")
        .max(100, "Limit cannot exceed 100.")
        .optional()
        .default(17),
      searchQuery: yup
        .string()
        .optional()
        .trim()
        .min(
          1,
          "Search query must contain at least one non-whitespace character"
        ),
      IsActive: yup
        .string()
        .oneOf(["", "true", "false"], "Invalid value for IsActive.")
        .optional(),
    }),
  }),

  getById: yup.object({
    params: yup.object({
      id: yup
        .string()
        .uuid("Invalid user role ID.")
        .required("user ID is required."),
    }),
  }),

  create: yup.object({
    body: yup.object({
      firstName: yup
        .string()
        .required("First Name is required.")
        .max(50, "First Name must be 50 characters long."),
      lastName: yup
        .string()
        .max(50, "Last Name must be 50 characters long.")
        .nullable()
        .optional(),
      phone: yup
        .string()
        .nullable()
        .notRequired()
        .test(
          "is-valid-phone",
          "Phone must be a valid phone number.",
          (value) => {
            if (!value || value.trim() === "") return true;
            return phoneRegExp.test(value);
          }
        )
        .max(20, "Phone must be 20 characters long."),

      email: yup
        .string()
        .required("Email is Required.")
        .email("Email should be valid and contain @.")
        .max(50, "Email must be 50 characters long.")
        .test(
          "Email not used",
          "Email is already registered.",
          async (email) => {
            const existUser = await User.findOne({ where: { email } });
            return existUser ? false : true;
          }
        ),
      gender: yup
        .string()
        .oneOf(["", "Male", "Female"], "Gender must be 'male' or 'female'.")
        .nullable()
        .optional(),
      roleIds: yup
        .array()
        .of(yup.string().uuid("Invalid user role ID.").trim())
        .min(1, "At least one role ID is required.")
        .required("Role IDs are required."),

      productionIds: yup
        .array()
        .of(yup.string().uuid("Invalid production ID."))
        .min(1, "At least one production ID is required.")
        .required("Production IDs are required."),

      isActive: yup
        .string()
        .oneOf(["true", "false"], "Invalid value for IsActive.")
        .required(),
    }),
  }),

  update: yup.object({
    params: yup.object({
      id: yup
        .string()
        .uuid("Invalid user role ID.")
        .required("user ID is required."),
    }),
    body: yup.object({
      firstName: yup
        .string()
        .required("first Name is required.")
        .max(50, "First Name must be 50 characters long."),
      lastName: yup
        .string()
        .nullable()
        .max(50, "last Name must be 50 characters long.")
        .optional(),
      phone: yup
        .string()
        .nullable()
        .notRequired()
        .test(
          "is-valid-phone",
          "Phone must be a valid phone number.",
          (value) => {
            if (!value || value.trim() === "") return true;
            return phoneRegExp.test(value);
          }
        )
        .max(20, "Phone must be 20 characters long."),
      gender: yup
        .string()
        .oneOf(["", "Male", "Female"], "Gender must be 'male' or 'female'.")
        .nullable()
        .optional(),
      rolesToAdd: yup.array().of(yup.string().uuid("Invalid user role ID.")),
      rolesToRemove: yup.array().of(yup.string().uuid("Invalid user role ID.")),
      productionsToAdd: yup
        .array()
        .of(yup.string().uuid("Invalid production ID.")),
      productionsToRemove: yup
        .array()
        .of(yup.string().uuid("Invalid production ID.")),

      isActive: yup
        .string()
        .oneOf(["true", "false"], "Invalid value for IsActive.")
        .required(),
    }),
  }),

  delete: yup.object({
    params: yup.object({
      id: yup
        .string()
        .uuid("Invalid user ID.")
        .required("user ID is required."),
    }),
  }),

  multipleDelete: yup.object({
    body: yup.object({
      ids: yup
        .array()
        .of(yup.string().uuid("Invalid User IDs."))
        .required("Ids are required.")
        .min(1, "At least one ID is required."),
    }),
  }),

  checkEmail: yup.object({
    body: yup.object({
      email: yup
        .string()
        .email("Email should be valid and contain @.")
        .max(50, "Email must be 50 characters long.")
        .required("Email is Required."),
    }),
  }),

  checkSecretKey: yup.object({
    body: yup.object({
      password: yup
        .string()
        .max(4, "Reset password must be exactly 4 digits.")
        .max(4, "Reset password must be exactly 4 digits.")
        .required("Reset password is required"),
      email: yup
        .string()
        .email("Email should be valid and contain @.")
        .max(50, "Email must be 50 characters long.")
        .required("Email is Required."),
    }),
  }),

  setNewPassword: yup.object({
    params: yup.object({
      id: yup
        .string()
        .required("Token is required")
        .matches(
          /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/,
          "Invalid token format"
        ),
    }),
    body: yup.object({
      password: yup
        .string()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters long")
        .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
        .matches(/[a-z]/, "Password must contain at least one lowercase letter")
        .matches(/[0-9]/, "Password must contain at least one number")
        .matches(
          /[!@#$%^&*(),.?":{}|<>]/,
          "Password must contain at least one special character"
        ),
    }),
  }),

  resetPassword: yup.object({
    params: yup.object({
      id: yup
        .string()
        .uuid("Invalid user role ID.")
        .required("user ID is required."),
    }),
    body: yup.object({
      password: yup
        .string()
        .max(4, "Reset password must be exactly 4 digits.")
        .max(4, "Reset password must be exactly 4 digits.")
        .required("Reset password is required"),
    }),
  }),

  forgetPassword: yup.object({
    body: yup.object({
      email: yup
        .string()
        .email("Email should be valid and contain @.")
        .max(50, "Email must be 50 characters long.")
        .required("Email is Required."),
      password: yup
        .string()
        .max(4, "Reset password must be exactly 4 digits.")
        .max(4, "Reset password must be exactly 4 digits.")
        .required("Reset password is required"),
    }),
  }),

  changePassword: yup.object({
    body: yup.object({
      newPassword: yup
        .string()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters long")
        .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
        .matches(/[a-z]/, "Password must contain at least one lowercase letter")
        .matches(/[0-9]/, "Password must contain at least one number")
        .matches(
          /[!@#$%^&*(),.?":{}|<>]/,
          "Password must contain at least one special character"
        ),
    }),
  }),

  checkCurrentPassword: yup.object({
    body: yup.object({
      password: yup
        .string()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters long")
        .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
        .matches(/[a-z]/, "Password must contain at least one lowercase letter")
        .matches(/[0-9]/, "Password must contain at least one number")
        .matches(
          /[!@#$%^&*(),.?":{}|<>]/,
          "Password must contain at least one special character"
        ),
    }),
  }),
  updateProfile: yup.object({
    body: yup.object({
      firstName: yup
        .string()
        .required("first Name is required.")
        .max(50, "First Name must be 50 characters long."),
      lastName: yup
        .string()
        .nullable()
        .max(50, "last Name must be 50 characters long.")
        .optional(),
      phone: yup
        .string()
        .nullable()
        .notRequired()
        .test(
          "is-valid-phone",
          "Phone must be a valid phone number.",
          (value) => {
            if (value && value.trim() !== "") {
              return /^\+?(\d{1,4})?[-.\s]?(\(?\d{1,3}\)?[-.\s]?)?(\d{1,4})[-.\s]?\d{1,4}[-.\s]?\d{1,4}$/.test(
                value
              );
            }
            return true;
          }
        )
        .max(20, "Phone must be 20 characters long.")
        .optional(),
      gender: yup
        .string()
        .oneOf(["", "Male", "Female"], "Gender must be 'Male' or 'Female'.")
        .nullable()
        .optional(),
    }),
  }),
};

module.exports = userSchema;
