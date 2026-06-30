import { InMemoryService, Task } from '../database/in-memory.service';
type CreateTaskBody = Omit<Task, 'id'>;
export declare class TasksController {
    private readonly store;
    constructor(store: InMemoryService);
    list(tenantId?: string): Task[];
    create(body: CreateTaskBody): Task;
}
export {};
