import type { LeadStage } from './lead.types';
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
export type Deal = {
    id: string;
    leadId: string;
    customer: string;
    property: string;
    value: string;
    stage: LeadStage;
    probability: number;
    closeDate: string;
    owner: string;
};
export type ForecastingStageBucket = {
    stageId: string;
    stageName: string;
    probability: number;
    dealCount: number;
    rawVolume: number;
    weightedVolume: number;
};
export type RevenueForecastReport = {
    totalRawPipeline: number;
    totalWeightedPipeline: number;
    stages: ForecastingStageBucket[];
};
