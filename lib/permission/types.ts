export interface AccessDefinition {
    id?: string;
    group: string;
    name: string;
    description: string;
    permissions: string[];
}

export type AccessPermissionsMap = Record<string, string[]>;
