import { AccessDefinition } from "@/lib/permission/types";

const userDefinition: AccessDefinition = {
    id: 'user',
    group: 'user-management',
    name: 'User Management',
    description: 'Manage user and user processing',
    permissions: ['read', 'create', 'update', 'delete', 'cancel', 'confirm', 'process'],
};

export default userDefinition;
