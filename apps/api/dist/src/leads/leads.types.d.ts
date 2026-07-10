export declare const LEAD_STATUSES: readonly ["NEW", "CONTACTED", "QUALIFIED", "FOLLOW_UP", "WON", "LOST", "CONVERTED"];
export type LeadStatus = (typeof LEAD_STATUSES)[number];
export type ConvertLeadInput = {
    createAccount?: boolean;
    accountId?: string | null;
    deal?: {
        name: string;
        value: number | string;
        stageId: string;
    } | null;
};
export type CreateLeadInput = {
    firstName: string;
    lastName: string;
    company?: string;
    email?: string;
    phone?: string;
    status?: string;
    sourceId?: string;
    ownerId?: string;
};
export type UpdateLeadInput = {
    firstName?: string;
    lastName?: string;
    company?: string;
    email?: string;
    phone?: string;
    status?: string;
    sourceId?: string | null;
    ownerId?: string | null;
};
export type UpdateLeadStatusInput = {
    status: string;
};
