import { PrismaService } from '../database/prisma.service';
import { CreateProjectInput, UpdateProjectInput } from './projects.types';
export declare class ProjectsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(tenantId: string): Promise<{
        unitsCount: number;
        _count: {
            buildings: number;
        };
        id: string;
        tenantId: string;
        name: string;
        description: string | null;
        status: string;
    }[]>;
    get(tenantId: string, id: string): Promise<{
        buildings: {
            unitsCount: number;
            _count: {
                floors: number;
            };
            id: string;
            tenantId: string;
            name: string;
            projectId: string;
            floorsCount: number;
        }[];
        unitsCount: number;
        _count: {
            buildings: number;
        };
        id: string;
        tenantId: string;
        name: string;
        description: string | null;
        status: string;
    }>;
    create(tenantId: string, userId: string, input: CreateProjectInput): Promise<{
        _count: {
            buildings: number;
        };
    } & {
        id: string;
        tenantId: string;
        name: string;
        description: string | null;
        status: string;
    }>;
    update(tenantId: string, userId: string, id: string, input: UpdateProjectInput): Promise<{
        _count: {
            buildings: number;
        };
    } & {
        id: string;
        tenantId: string;
        name: string;
        description: string | null;
        status: string;
    }>;
    remove(tenantId: string, userId: string, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    private normalizeStatus;
    private recordAudit;
}
