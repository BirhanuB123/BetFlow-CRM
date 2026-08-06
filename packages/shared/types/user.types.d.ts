export type UserStatus = 'Active' | 'Invited' | 'Suspended';
export type AuthenticatedUser = {
    id: string;
    email: string;
    roles: string[];
};
export type JwtPayload = {
    sub: string;
    email: string;
    roles: string[];
    iat: number;
    exp: number;
};
export type AuthenticatedRequest = {
    headers: {
        authorization?: string;
    };
    user?: AuthenticatedUser;
};
export type PublicUser = {
    id: string;
    name: string;
    email: string;
    role: string;
    status: UserStatus;
    lastSeen?: string;
};
export type PortalAuthInput = {
    identifier: string;
};
export type PortalAuthResponse = {
    accessToken: string;
    customer: {
        id: string;
        firstName: string;
        lastName: string;
        email: string | null;
        phone: string | null;
    };
};
export type BankSlipUploadInput = {
    scheduleId: string;
    bankName: string;
    referenceNumber: string;
    amount: number;
    slipUrl?: string;
    notes?: string;
};
export type BankSlipSubmissionResult = {
    id: string;
    scheduleId: string;
    status: 'PENDING_VERIFICATION' | 'APPROVED' | 'REJECTED';
    bankName: string;
    referenceNumber: string;
    submittedAt: string;
};
