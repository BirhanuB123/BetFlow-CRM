import { PrismaService } from '../database/prisma.service';
type ListOptions = {
    entityType?: string;
    entityId?: string;
    limit?: number;
};
export declare class ActivitiesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(options?: ListOptions): Promise<{
        id: string;
        action: string;
        label: string;
        detail: string | null;
        entityType: string;
        entityId: string;
        actor: string;
        createdAt: Date;
    }[]>;
    private labelFor;
    private detailFor;
}
export {};
