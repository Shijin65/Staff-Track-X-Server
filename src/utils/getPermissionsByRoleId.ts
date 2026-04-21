import PERMISSIONS from "../constants/Permissions";
import { ROLES } from "./rolePermissionMap";

const ROLE_BY_ID = Object.values(ROLES).reduce((acc: any, role) => {
    acc[role.roleId] = role;
    return acc;
}, {});


function getPermissionsByRoleId(roleId: number, isSuperAdmin: boolean) {
    const allPermissions = Object.values(PERMISSIONS);
    let userPermissions: string[] = [];

    if (isSuperAdmin) {
        userPermissions = allPermissions;
    } else {
        const role = ROLE_BY_ID[roleId];
        userPermissions = role ? role.permissions : [];
    }

    return allPermissions.reduce((acc, permission) => {
        acc[permission] = userPermissions.includes(permission);
        return acc;
    }, {} as Record<string, boolean>);
}
function getUserRole(roleId: number) {
    return ROLE_BY_ID[roleId];
}
export { getPermissionsByRoleId, getUserRole };