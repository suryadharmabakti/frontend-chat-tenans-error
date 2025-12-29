export function hasPermission(user: any, permission: string): boolean {
    const [module, action] = permission.split(":");
    const modulePerm = user.permissions?.[module];
    return Array.isArray(modulePerm) && modulePerm.includes(action);
}