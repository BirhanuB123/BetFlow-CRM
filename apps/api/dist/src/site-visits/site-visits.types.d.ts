export declare const SITE_VISIT_STATUSES: readonly ["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"];
export type SiteVisitStatus = (typeof SITE_VISIT_STATUSES)[number];
export type CreateSiteVisitInput = {
    date: string;
    status?: string;
    notes?: string;
    leadId?: string | null;
    customerId?: string | null;
};
export type UpdateSiteVisitInput = {
    date?: string;
    notes?: string | null;
    leadId?: string | null;
    customerId?: string | null;
};
export type UpdateSiteVisitStatusInput = {
    status: string;
};
