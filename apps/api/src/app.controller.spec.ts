import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return the phase-two API manifest', () => {
      expect(appController.getHello()).toEqual({
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
          'site-visits',
          'reservations',
          'payments',
          'documents',
          'contracts',
          'notifications',
          'reports',
          'saas',
        ],
      });
    });
  });
});
