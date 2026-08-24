import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../src/common/guards/roles.guard';
import { PERMISSIONS_KEY, ROLES_KEY } from '../src/common/decorators/roles.decorator';
import type { AuthenticatedRequest } from '../src/core/auth/auth.types';

describe('RBAC Permission Migration & Enforcement Test', () => {
  let guard: RolesGuard;
  let reflector: Reflector;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      auditLog: {
        create: jest.fn().mockResolvedValue({ id: 'audit-forbidden-1' }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        Reflector,
        { provide: 'PrismaService', useValue: mockPrisma },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  function createMockContext(user: any, requiredPermissions?: string[], requiredRoles?: string[]) {
    const handler = () => {};
    const targetClass = class {};

    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key: any) => {
      if (key === PERMISSIONS_KEY) return requiredPermissions;
      if (key === ROLES_KEY) return requiredRoles;
      return undefined;
    });

    const mockRequest: Partial<AuthenticatedRequest> = {
      url: '/leads',
      user,
    };

    return {
      getHandler: () => handler,
      getClass: () => targetClass,
      switchToHttp: () => ({
        getRequest: () => mockRequest as AuthenticatedRequest,
      }),
    } as any;
  }

  describe('Permission Guard Enforcement', () => {
    it('should ALLOW access to custom role with leads.manage permission on @RequirePermission("leads.manage")', async () => {
      const customUser = {
        id: 'usr-custom-admin',
        email: 'sysadmin@betflow.example',
        roles: ['System Admin'], // Custom role name!
        permissions: ['leads.manage', 'reports.view'],
      };

      const context = createMockContext(customUser, ['leads.manage']);
      const canAccess = await guard.canActivate(context);

      expect(canAccess).toBe(true);
    });

    it('should ALLOW built-in roles (Owner, Agent, Sales Manager) with matching permissions', async () => {
      const agentUser = {
        id: 'usr-agent-001',
        email: 'agent@betflow.example',
        roles: ['Agent'],
        permissions: ['leads.manage', 'site-visits.manage', 'tasks.manage', 'meetings.manage'],
      };

      const context = createMockContext(agentUser, ['leads.manage']);
      const canAccess = await guard.canActivate(context);

      expect(canAccess).toBe(true);
    });

    it('should REJECT access (return false) when user lacks required permission', async () => {
      const unprivilegedUser = {
        id: 'usr-marketing-001',
        email: 'marketing@betflow.example',
        roles: ['Marketing'],
        permissions: ['campaigns.manage', 'reports.view'], // Lacks leads.manage or users.manage
      };

      const context = createMockContext(unprivilegedUser, ['users.manage']);
      const canAccess = await guard.canActivate(context);

      expect(canAccess).toBe(false);
    });

    it('should ALLOW legacy @Roles match for backwards compatibility', async () => {
      const legacyUser = {
        id: 'usr-legacy-owner',
        email: 'owner@betflow.example',
        roles: ['Owner'],
        permissions: [],
      };

      const context = createMockContext(legacyUser, undefined, ['Owner', 'Admin']);
      const canAccess = await guard.canActivate(context);

      expect(canAccess).toBe(true);
    });
  });
});
