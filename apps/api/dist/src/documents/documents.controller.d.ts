import { StreamableFile } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
import { type IncomingDocumentFile } from './document-storage.service';
import { type CreateDocumentBody, type DocumentFilters, DocumentsService, type ReviewDocumentBody } from './documents.service';
type ResponseHeaders = {
    setHeader(name: string, value: string): void;
};
export declare class DocumentsController {
    private readonly documents;
    constructor(documents: DocumentsService);
    list(user: AuthenticatedUser, filters: DocumentFilters): Promise<any[]>;
    upload(user: AuthenticatedUser, file: IncomingDocumentFile, body: CreateDocumentBody): Promise<any>;
    download(user: AuthenticatedUser, id: string, response: ResponseHeaders): Promise<StreamableFile>;
    review(user: AuthenticatedUser, id: string, body: ReviewDocumentBody): Promise<any>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    private safeFileName;
}
export {};
