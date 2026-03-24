const yup = require("yup");

const rolePermissionSchema = {
  //GET PERMISSIONS BY ID
  getById: yup.object({
    params: yup.object({
      id: yup
        .string()
        .uuid("Invalid user role ID.")
        .required("User role ID is required."),
    }),
  }),
};
module.exports = rolePermissionSchema;
