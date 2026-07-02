export declare const LEAD_STATUSES: readonly ["NEW", "CONTACTED", "QUALIFIED", "FOLLOW_UP", "WON", "LOST"];
export type LeadStatus = (typeof LEAD_STATUSES)[number];
export type CreateLeadInput = {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    status?: string;
    sourceId?: string;
};
export type UpdateLeadStatusInput = {
    status: string;
};
