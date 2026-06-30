import { InMemoryService } from '../database/in-memory.service';
import type { ContractTemplate, GeneratedContractPdf, LegalContractApproval, SignedContract } from '../database/in-memory.service';
type CreateContractTemplateBody = Omit<ContractTemplate, 'id' | 'updatedAt'>;
type GenerateContractPdfBody = Omit<GeneratedContractPdf, 'id' | 'generatedAt'>;
type CreateLegalApprovalBody = Omit<LegalContractApproval, 'id' | 'submittedAt'>;
type CreateSignedContractBody = Omit<SignedContract, 'id'>;
export declare class ContractsController {
    private readonly store;
    constructor(store: InMemoryService);
    listTemplates(tenantId?: string): ContractTemplate[];
    createTemplate(body: CreateContractTemplateBody): ContractTemplate;
    listGenerated(tenantId?: string): GeneratedContractPdf[];
    generatePdf(body: GenerateContractPdfBody): GeneratedContractPdf;
    listApprovals(tenantId?: string): LegalContractApproval[];
    createApproval(body: CreateLegalApprovalBody): LegalContractApproval;
    updateApprovalStatus(id: string, status: LegalContractApproval['status'], note?: string): LegalContractApproval;
    listSigned(tenantId?: string): SignedContract[];
    createSigned(body: CreateSignedContractBody): SignedContract;
}
export {};
