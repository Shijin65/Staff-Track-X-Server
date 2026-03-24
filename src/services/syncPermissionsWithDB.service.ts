import { logger } from "../config/loggerConfig";
import API_PERMISSIONS from "../constants/apiPermissions";
import db from "../models";

const PermissionName = db.permissions;

interface PermissionItem {
    category: string;
    title: string;
}

type PermissionObject = Record<string, Record<string, string>>;

async function syncPermissionsWithDB(): Promise<void> {
    const transformedPermissions = transformPermissions(API_PERMISSIONS);
    const permissionArray = permissionsToArray(transformedPermissions);

    const dbPermissions = await PermissionName.findAll({ raw: true });

    const dbPermissionNames = dbPermissions.map((item: any) => item.title);
    const newPermissionNames = permissionArray.map((p) => p.title);

    const toAdd = permissionArray.filter(
        (p) => !dbPermissionNames.includes(p.title)
    );

    const toRemove = dbPermissions
        .filter((p: any) => !newPermissionNames.includes(p.title))
        .map((p: any) => p.permissionId);

    if (toAdd.length) {
        await PermissionName.bulkCreate(toAdd, { ignoreDuplicates: true });
    }

    if (toRemove.length) {
        await PermissionName.destroy({ where: { permissionId: toRemove } });
    }
    logger.info("Permissions synced successfully!")
}

// HELPER FUNCTION

const transformPermissions = (
    permissionObject: PermissionObject
): Record<string, string[]> =>
    Object.keys(permissionObject).reduce((result, category) => {
        const formattedCategory = category
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())
            .trim();

        result[formattedCategory] = Object.values(permissionObject[category]);

        return result;
    }, {} as Record<string, string[]>);

function permissionsToArray(
    permissions: Record<string, string[]>
): PermissionItem[] {
    return Object.entries(permissions).flatMap(([category, titles]) =>
        titles.map((title) => ({ category, title }))
    );
}

export default syncPermissionsWithDB;