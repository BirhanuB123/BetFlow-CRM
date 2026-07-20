import { PrismaService } from '../database/prisma.service';
import { CreateNoteInput } from './notes.types';
export declare class NotesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(filters?: {
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
        createdAt: Date;
        entityType: string;
        entityId: string;
        content: string;
        authorId: string;
    })[]>;
    create(userId: string, input: CreateNoteInput): Promise<{
        author: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        entityType: string;
        entityId: string;
        content: string;
        authorId: string;
    }>;
    remove(userId: string, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
