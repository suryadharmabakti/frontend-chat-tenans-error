import { PrismaClient } from "@prisma/client";
import { buildPaginatedQuery } from "@/lib/helper/pagination-query.helper";
import { ResponseHelper } from "@/lib/helper/response.helper";

const prisma = new PrismaClient();

export async function getAllData(payload: Record<string, any>) {
    try {
        const baseQuery = `
            select 
                roles.id,
                roles.name,
                roles.description,
                roles.created_at,
                tenants.name as tenant_name
            from roles
            join tenants on tenants.id = roles.tenant_id
        `;

        const res = await buildPaginatedQuery({
            payload,
            baseQuery,
            tableName: "roles",
            dataSource: prisma,
            responseHelper: ResponseHelper,
            serviceName: "RolesService",
        });

        if (!res.success) throw Error(res.error)
        return res;
    } catch (err) {
        throw ResponseHelper.handleError(err, "Failed to get user");
    }
}

export async function getDataById(id: string) {
    if (!id) throw Error("Role ID is required");

    try {
        const data: any[] = await prisma.$queryRaw`
            select 
                id,
                name,
                description,
                permissions
            from roles 
            where id::text = ${id}
        `;

        if (!data.length) {
            return ResponseHelper.handleError(
                { status: 404, message: "Role not found" },
                "Failed to get role by id"
            );
        }

        const role = data[0];

        const flatPermissions: string[] = [];

        for (const resourceKey in role.permissions) {
            const actions = role.permissions[resourceKey];
            if (Array.isArray(actions)) {
                for (const action of actions) {
                    flatPermissions.push(`${resourceKey}:${action}`);
                }
            }
        }

        role.permissions = flatPermissions;

        return ResponseHelper.handleSuccess(role, "Role fetched successfully");
    } catch (error) {
        return ResponseHelper.handleError(error, "Failed to get role by id");
    }
}

export async function createData(data: any) {
    try {
        const { name, description, tenant_id, permissions } = data;

        const structuredPermissions: Record<string, string[]> = {};

        const rawPermissions = permissions as string[];

        for (const permission of rawPermissions) {
            const [module, action] = permission.split(":");
            if (!structuredPermissions[module]) {
                structuredPermissions[module] = [];
            }
            structuredPermissions[module].push(action);
        }

        const role = await prisma.role.create({
            data: {
                name,
                tenant_id,
                description,
                permissions: structuredPermissions,
            },
        });

        return ResponseHelper.handleSuccess(role, "Role created successfully");
    } catch (err) {
        throw ResponseHelper.handleError(err, "Failed to create role");
    }
}

export async function updateData(data: any) {
    const { id, name, description, tenant_id, permissions } = data;

    if (!id) throw new Error("Role ID is required");

    try {
        const updatePayload: Record<string, any> = {};

        if (name !== undefined) updatePayload.name = name;
        if (description !== undefined) updatePayload.description = description;
        if (tenant_id !== undefined) updatePayload.tenant_id = tenant_id;

        if (permissions) {
            const structuredPermissions: Record<string, string[]> = {};

            for (const permission of permissions) {
                const [module, action] = permission.split(":");
                if (!structuredPermissions[module]) {
                    structuredPermissions[module] = [];
                }
                structuredPermissions[module].push(action);
            }

            updatePayload.permissions = structuredPermissions;
        }

        const updatedRole = await prisma.role.update({
            where: { id },
            data: updatePayload,
        });

        return ResponseHelper.handleSuccess(updatedRole, "Role updated successfully");
    } catch (err) {
        throw ResponseHelper.handleError(err, "Failed to update role");
    }
}

export async function deleteData(id: string) {
    if (!id) throw Error("Role ID is required");

    try {
        await prisma.role.delete({ where: { id } });
        return ResponseHelper.handleSuccess(null, "Role deleted successfully");
    } catch (err) {
        throw ResponseHelper.handleError(err, "Failed to delete role");
    }
}