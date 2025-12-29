import { AccessDefinition } from "@/lib/permission/types";

const roleDefinition: AccessDefinition = {
    id: 'role',
    group: 'access-management',
    name: 'Role Management',
    description: 'Manage role and role processing',
    permissions: ['read', 'create', 'update', 'delete', 'cancel', 'confirm', 'process'],
};

export default roleDefinition;
