import { InMemoryService } from '../database/in-memory.service';
import type { UploadedDocument } from '../database/in-memory.service';
type CreateUploadedDocumentBody = Omit<UploadedDocument, 'id' | 'uploadedAt'>;
export declare class DocumentsController {
    private readonly store;
    constructor(store: InMemoryService);
    list(tenantId?: string): UploadedDocument[];
    upload(body: CreateUploadedDocumentBody): UploadedDocument;
    updateStatus(id: string, status: UploadedDocument['status']): UploadedDocument;
}
export {};
