export type ActivityType = "Call" | "Email" | "Assignment" | "Task" | "Note" | "Deal";
export type Activity = {
    id: string;
    actor: string;
    action: string;
    target: string;
    time: string;
    type: ActivityType;
};
export type CreateNoteInput = {
    content: string;
    entityType?: string;
    entityId?: string;
};
export type AuditLogEntry = {
    id: string;
    userId: string;
    user?: {
        id: string;
        firstName: string;
        lastName: string;
    } | null;
    action: string;
    entityType: string;
    entityId: string;
    newValues: Record<string, unknown> | null;
    createdAt: string;
};
export type Note = {
    id: string;
    relatedTo: string;
    author: string;
    body: string;
    createdAt: string;
};
