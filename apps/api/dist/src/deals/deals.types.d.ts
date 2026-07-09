export type CreateDealInput = {
    name: string;
    value: number | string;
    stageId: string;
    customerId: string;
    accountId?: string | null;
    unitId?: string | null;
};
export type UpdateDealInput = {
    name?: string;
    value?: number | string;
    stageId?: string;
    customerId?: string;
    accountId?: string | null;
    unitId?: string | null;
};
export type MoveDealStageInput = {
    stageId: string;
};
