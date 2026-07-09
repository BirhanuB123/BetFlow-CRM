import { NotesService } from './notes.service';
import type { AuthenticatedUser } from '../auth/auth.types';
import type { CreateNoteInput } from './notes.types';
export declare class NotesController {
    private readonly notes;
    constructor(notes: NotesService);
    list(user: AuthenticatedUser, entityType?: string, entityId?: string): import("@prisma/client").Prisma.PrismaPromise<({
        author: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        entityType: string;
        entityId: string;
        content: string;
        authorId: string;
    })[]>;
    create(user: AuthenticatedUser, body: CreateNoteInput): Promise<{
        author: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        entityType: string;
        entityId: string;
        content: string;
        authorId: string;
    }>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
