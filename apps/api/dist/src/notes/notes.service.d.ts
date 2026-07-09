import { PrismaService } from '../database/prisma.service';
import { CreateNoteInput } from './notes.types';
export declare class NotesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(tenantId: string, filters?: {
        entityType?: string;
        entityId?: string;
    }): import("@prisma/client").Prisma.PrismaPromise<({
        author: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        tenantId: string;
        content: string;
        authorId: string;
        entityType: string;
        entityId: string;
        createdAt: Date;
    })[]>;
    create(tenantId: string, userId: string, input: CreateNoteInput): Promise<{
        author: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        tenantId: string;
        content: string;
        authorId: string;
        entityType: string;
        entityId: string;
        createdAt: Date;
    }>;
    remove(tenantId: string, userId: string, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
