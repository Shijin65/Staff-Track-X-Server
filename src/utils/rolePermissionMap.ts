import PERMISSIONS from "../constants/Permissions";

export const ROLES = {
    SUPER_ADMIN: {
        roleId: 1000,
        name: "super_admin",
        permissions: Object.values(PERMISSIONS),
    },

    SUPERVISOR: {
        roleId: 1002,
        name: "supervisor",
        permissions: Object.values(PERMISSIONS),
    },

    CAPTAIN: {
        roleId: 1004,
        name: "captain",
        permissions: Object.values(PERMISSIONS),
    },

    VICE_CAPTAIN: {
        roleId: 1005,
        name: "vice_captain",
        permissions: Object.values(PERMISSIONS).filter(
            (permission) => ![PERMISSIONS.CREATE_USER, PERMISSIONS.UPDATE_USER, PERMISSIONS.DELETE_USER, PERMISSIONS.CREATE_EVENT, PERMISSIONS.UPDATE_EVENT, PERMISSIONS.DELETE_EVENT].includes(permission)
        ),
    },

    SERVICE_BOYS: {
        roleId: 1006,
        name: "service_boys",
        permissions: [],
    },

    COAT_BOYS: {
        roleId: 1007,
        name: "coat_boys",
        permissions: [],
    },

    HOSTING_GIRLS: {
        roleId: 1008,
        name: "hosting_girls",
        permissions: [],
    },

    HOUSE_KEEPING: {
        roleId: 1009,
        name: "house_keeping",
        permissions: [],
    },
    STAFF: {
        roleId: 1010,
        name: "staff",
        permissions: [],
    },
};
