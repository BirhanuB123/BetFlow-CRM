export declare const PROJECT_STATUSES: readonly ["PLANNING", "ACTIVE", "SELLING", "COMPLETED", "ON_HOLD"];
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export type CreateProjectInput = {
    name: string;
    description?: string | null;
    status?: string;
};
export type UpdateProjectInput = {
    name?: string;
    description?: string | null;
    status?: string;
};
