type PermissionActions = {
  create: string;
  view: string;
  update: string;
  delete: string;
};

type ApiPermissions = {
  user: PermissionActions;
  userRole: PermissionActions;
};

const API_PERMISSIONS: ApiPermissions = {
  user: {
    create: "Create User",
    view: "View User",
    update: "Update User",
    delete: "Delete User",
  },
  userRole: {
    create: "Create UserRole",
    view: "View UserRole",
    update: "Update UserRole",
    delete: "Delete UserRole",
  },
};

export default API_PERMISSIONS;