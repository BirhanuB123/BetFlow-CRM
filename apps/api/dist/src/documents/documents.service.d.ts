import { PrismaService } from '../database/prisma.service';
import type { AuthenticatedUser } from '../auth/auth.types';
import { DocumentStorageService, type IncomingDocumentFile } from './document-storage.service';
export type CreateDocumentBody = {
    category?: string;
    entityType?: string;
    entityId?: string;
    expiresAt?: string;
};
export type ReviewDocumentBody = {
    status?: string;
    rejectionReason?: string;
};
export type DocumentFilters = {
    entityType?: string;
    entityId?: string;
    category?: string;
    status?: string;
};
export declare class DocumentsService {
    private readonly prisma;
    private readonly storage;
    constructor(prisma: PrismaService, storage: DocumentStorageService);
    list(tenantId: string, filters?: DocumentFilters): Promise<any[]>;
    upload(user: AuthenticatedUser, input: CreateDocumentBody, file: IncomingDocumentFile): Promise<any>;
    review(user: AuthenticatedUser, id: string, input: ReviewDocumentBody): Promise<any>;
    download(tenantId: string, id: string): Promise<{
        document: {
            uploadedBy: {
                id: string;
                firstName: string;
                lastName: string;
            } | null;
            reviewedBy: {
                id: string;
                firstName: string;
                lastName: string;
            } | null;
        } & {
            id: string;
            tenantId: string;
            updatedAt: Date;
            name: string;
            status: string;
            fileUrl: string;
            storageKey: string | null;
            mimeType: string | null;
            sizeBytes: number | null;
            checksum: string | null;
            category: string;
            entityType: string;
            entityId: string;
            uploadedById: string | null;
            reviewedById: string | null;
            reviewedAt: Date | null;
            rejectionReason: string | null;
            expiresAt: Date | null;
            uploadedAt: Date;
        };
        stream: import("fs").ReadStream;
    }>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    private findForTenant;
    private assertEntityBelongsToTenant;
    private normalizeCategory;
    private normalizeStatus;
    private normalizeEntityType;
    private normalizeFromList;
    private normalizeOptionalDate;
    private serialize;
    private recordAudit;
}
