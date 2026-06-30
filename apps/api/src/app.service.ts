import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      name: 'BetFlow CRM API',
      phase: 'phase-two',
      modules: [
        'auth',
        'tenants',
        'users',
        'roles',
        'permissions',
        'audit-logs',
        'leads',
        'customers',
        'deals',
        'tasks',
        'notes',
        'activities',
        'projects',
        'properties',
        'units',
      ],
    };
  }
}
