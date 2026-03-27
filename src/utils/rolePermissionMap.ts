import PERMISSIONS from "../constants/Permissions";

export const ROLES = {
    SUPER_ADMIN: {
        roleId: 1000,
        name: "super_admin",
        permissions: Object.values(PERMISSIONS),
    },

    ADMIN: {
        roleId: 1001,
        name: "admin",
        permissions: Object.values(PERMISSIONS),
    },

    SUPERVISOR: {
        roleId: 1002,
        name: "supervisor",
        permissions: Object.values(PERMISSIONS).filter(
            (permission) => ![PERMISSIONS.CREATE_USER, PERMISSIONS.UPDATE_USER, PERMISSIONS.DELETE_USER, PERMISSIONS.VERIFY_USER].includes(permission)
        ),
    },

    STAFF: {
        roleId: 1003,
        name: "staff",
        permissions: [
            PERMISSIONS.VIEW_EVENT,

        ],
    },
};
