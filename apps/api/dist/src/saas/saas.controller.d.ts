import { InMemoryService } from '../database/in-memory.service';
import type { BrandingSetting, DataTransferJob, TenantDomain } from '../database/in-memory.service';
type CreateTenantDomainBody = Omit<TenantDomain, 'id'>;
type CreateDataTransferJobBody = Omit<DataTransferJob, 'id' | 'requestedAt'>;
export declare class SaasController {
    private readonly store;
    constructor(store: InMemoryService);
    plans(tenantId?: string): import("../database/in-memory.service").SubscriptionPlan[];
    limits(tenantId?: string): import("../database/in-memory.service").FeatureLimit[];
    branding(tenantId?: string): BrandingSetting[];
    updateBranding(id: string, value: string, status?: BrandingSetting['status']): BrandingSetting;
    billing(tenantId?: string): import("../database/in-memory.service").TenantBillingItem[];
    domains(tenantId?: string): TenantDomain[];
    createDomain(body: CreateTenantDomainBody): TenantDomain;
    dataJobs(tenantId?: string): DataTransferJob[];
    createDataJob(body: CreateDataTransferJobBody): DataTransferJob;
}
export {};
