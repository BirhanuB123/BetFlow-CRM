import { ProjectsService } from './projects.service';
import type { AuthenticatedUser } from '../auth/auth.types';
import type { CreateProjectInput, UpdateProjectInput } from './projects.types';
export declare class ProjectsController {
    private readonly projects;
    constructor(projects: ProjectsService);
    list(user: AuthenticatedUser): Promise<{
        unitsCount: number;
        _count: {
            buildings: number;
        };
        id: string;
        name: string;
        description: string | null;
        status: string;
    }[]>;
    get(user: AuthenticatedUser, id: string): Promise<{
        buildings: {
            unitsCount: number;
            _count: {
                floors: number;
            };
            id: string;
            name: string;
            projectId: string;
            floorsCount: number;
        }[];
        unitsCount: number;
        _count: {
            buildings: number;
        };
        id: string;
        name: string;
        description: string | null;
        status: string;
    }>;
    create(user: AuthenticatedUser, body: CreateProjectInput): Promise<{
        _count: {
            buildings: number;
        };
    } & {
        id: string;
        name: string;
        description: string | null;
        status: string;
    }>;
    update(user: AuthenticatedUser, id: string, body: UpdateProjectInput): Promise<{
        _count: {
            buildings: number;
        };
    } & {
        id: string;
        name: string;
        description: string | null;
        status: string;
    }>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
