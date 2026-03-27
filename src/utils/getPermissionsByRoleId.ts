import PERMISSIONS from "../constants/Permissions";
import { ROLES } from "./rolePermissionMap";

const ROLE_BY_ID = Object.values(ROLES).reduce((acc, role) => {
    acc[role.roleId] = role;
    return acc;
}, {});


function getPermissionsByRoleId(roleId: number, isSuperAdmin: boolean) {
    if (isSuperAdmin) {
        return Object.values(PERMISSIONS);
    }
    const role = ROLE_BY_ID[roleId];
    if (!role) return [];

    return role.permissions;
}
function getUserRole(roleId: number) {
    return ROLE_BY_ID[roleId];
}
export { getPermissionsByRoleId, getUserRole };