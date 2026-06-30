import { InMemoryService, Note } from '../database/in-memory.service';
type CreateNoteBody = Omit<Note, 'id' | 'createdAt'>;
export declare class NotesController {
    private readonly store;
    constructor(store: InMemoryService);
    list(tenantId?: string): Note[];
    create(body: CreateNoteBody): Note;
}
export {};
