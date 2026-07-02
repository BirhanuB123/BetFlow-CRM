import { InMemoryService } from '../database/in-memory.service';
import type { BrandingSetting, DataTransferJob, TenantDomain } from '../database/in-memory.service';
type CreateTenantDomainBody = Omit<TenantDomain, 'id'>;
type CreateDataTransferJobBody = Omit<DataTransferJob, 'id' | 'requestedAt'>;
type ToggleFeatureFlagBody = {
    enabled: boolean;
};
type CompleteOnboardingStepBody = {
    completedByUserId: string;
};
type ExcelImportBody = {
    tenantId: string;
    template: string;
    fileName: string;
    rows: number;
};
export declare class SaasController {
    private readonly store;
    constructor(store: InMemoryService);
    plans(tenantId?: string): import("../database/in-memory.service").SubscriptionPlan[];
    limits(tenantId?: string): import("../database/in-memory.service").FeatureLimit[];
    trial(): {
        status: string;
        startedAt: string;
        endsAt: string;
        daysRemaining: number;
        conversionOwnerUserId: string;
    };
    usage(tenantId?: string): {
        usagePercent: number;
        exceeded: boolean;
        id: string;
        tenantId: string;
        feature: string;
        used: number;
        limit: number;
        unit: string;
    }[];
    listFeatureFlags(): {
        key: string;
        label: string;
        enabled: boolean;
        scope: string;
        rollout: string;
    }[];
    toggleFeatureFlag(key: string, body: ToggleFeatureFlagBody): {
        key: string;
        enabled: boolean;
        updatedAt: string;
    };
    branding(tenantId?: string): BrandingSetting[];
    updateBranding(id: string, value: string, status?: BrandingSetting['status']): BrandingSetting;
    billing(tenantId?: string): import("../database/in-memory.service").TenantBillingItem[];
    billingAccount(): {
        tenantId: string;
        accountName: string;
        billingEmail: string;
        taxId: string;
        paymentMethod: string;
        collectionMode: string;
        nextChargeAt: string;
    };
    domains(tenantId?: string): TenantDomain[];
    createDomain(body: CreateTenantDomainBody): TenantDomain;
    dataJobs(tenantId?: string): DataTransferJob[];
    createDataJob(body: CreateDataTransferJobBody): DataTransferJob;
    onboarding(): ({
        key: string;
        step: string;
        owner: string;
        status: string;
        dueAt: null;
    } | {
        key: string;
        step: string;
        owner: string;
        status: string;
        dueAt: string;
    })[];
    completeOnboardingStep(key: string, body: CompleteOnboardingStepBody): {
        key: string;
        status: string;
        completedByUserId: string;
        completedAt: string;
    };
    excelTemplates(): {
        template: string;
        entity: string;
        requiredColumns: string[];
    }[];
    createExcelImport(body: ExcelImportBody): {
        id: string;
        tenantId: string;
        template: string;
        fileName: string;
        rows: number;
        status: string;
        queuedAt: string;
    };
}
export {};
