import fs from "fs";
import path from "path";
import glob from "fast-glob";
import { pathToFileURL } from "url";

// Types
interface AccessDefinition {
    id: string;
    group: string;
    name: string;
    description: string;
    permissions: string[];
}

interface GroupMeta {
    name: string;
    description: string;
    icon: string;
    order: number;
    color: string;
}

// Configurable group metadata (customize as needed)
const groupMetadata: Record<string, GroupMeta> = {
    "access-management": {
        name: "Access & Role Management",
        description: "Manage system access, roles, and permissions",
        icon: "shield-check",
        order: 1,
        color: "#ef4444",
    },
    "user-management": {
        name: "User Management",
        description: "Manage users and user-related settings",
        icon: "users",
        order: 2,
        color: "#3b82f6",
    },
    "tenant-configuration": {
        name: "Tenant Configuration",
        description: "Manage tenant related configurations",
        icon: "user-circle",
        order: 4,
        color: "#10b981",
    },
    "customer-management": {
        name: "Customer Management",
        description: "Manage customers and customer-related configurations",
        icon: "user-circle",
        order: 3,
        color: "#10b981",
    },
    console: {
        name: "Console & Dashboard",
        description: "Main console access and dashboard features",
        icon: "squares-2x2",
        order: 0,
        color: "#6366f1",
    },
};

async function generatePermissions() {
    const files = await glob("app/console/**/access-definition.ts");

    const groups: Record<string, GroupMeta> = {};
    const items: Record<string, any> = {};

    for (const file of files) {
        const modulePath = pathToFileURL(path.resolve(file)).href;
        try {
            console.log(`🔍 Importing: ${modulePath}`);
            const defModule = await import(modulePath);
            const def: AccessDefinition = defModule.default;

            const id = def.id;
            const groupId = def.group;

            // Add group metadata if available, otherwise create a minimal one
            if (!groups[groupId]) {
                if (groupMetadata[groupId]) {
                    groups[groupId] = groupMetadata[groupId];
                } else {
                    // Auto-generate minimal metadata if group not predefined
                    groups[groupId] = {
                        name: groupId
                            .split("-")
                            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                            .join(" "),
                        description: "",
                        icon: "question-mark-circle",
                        order: 99,
                        color: "#9ca3af", // gray-400
                    };
                }
            }

            items[id] = {
                id,
                group: groupId,
                name: def.name,
                description: def.description,
                path: `/console/${id}`,
                permissions: def.permissions,
            };
        } catch (err) {
            console.error(`❌ Failed to import ${modulePath}`);
            throw err;
        }
    }

    const result = {
        _generated: true,
        _generatedAt: new Date().toISOString(),
        _source: "Generated from access-definition.ts files in /app/console",
        _warning: "DO NOT EDIT - This file is auto-generated. Edit module access-definition.ts files instead.",
        _stats: {
            totalGroups: Object.keys(groups).length,
            totalItems: Object.keys(items).length,
            generatedBy: "scripts/generate-access-permissions.ts",
        },
        groups,
        items,
    };

    const outputPath = path.join(process.cwd(), "access-permissions.json");
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log(`✅ Access permissions generated to ${outputPath}`);
}

generatePermissions().catch(console.error);
