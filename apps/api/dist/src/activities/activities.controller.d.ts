import { ActivitiesService } from './activities.service';
import type { AuthenticatedUser } from '../auth/auth.types';
export declare class ActivitiesController {
    private readonly activities;
    constructor(activities: ActivitiesService);
    list(user: AuthenticatedUser, entityType?: string, entityId?: string, limit?: string): Promise<{
        id: string;
        action: string;
        label: string;
        detail: string | null;
        entityType: string;
        entityId: string;
        actor: string;
        createdAt: Date;
    }[]>;
}
