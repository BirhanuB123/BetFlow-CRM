import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  function createMockContext(userRoles: string[] = []): ExecutionContext {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            id: 'test_user_id',
            email: 'test@example.com',
            roles: userRoles,
          },
        }),
      }),
    } as unknown as ExecutionContext;
  }

  it('should allow access if no roles are required on handler or class', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = createMockContext(['Agent']);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access if user has one of the required roles', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['Owner', 'Finance']);
    const context = createMockContext(['Finance']);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access (return false) if user lacks the required role', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['Owner', 'Finance']);
    const agentContext = createMockContext(['Agent']);

    expect(guard.canActivate(agentContext)).toBe(false);
  });

  it('should deny access to payment approvals for Agent and Marketing roles', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['Owner', 'Finance']);

    const agentContext = createMockContext(['Agent']);
    const marketingContext = createMockContext(['Marketing']);

    expect(guard.canActivate(agentContext)).toBe(false);
    expect(guard.canActivate(marketingContext)).toBe(false);
  });

  it('should allow access to payment approvals for Finance and Owner roles', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['Owner', 'Finance']);

    const financeContext = createMockContext(['Finance']);
    const ownerContext = createMockContext(['Owner']);

    expect(guard.canActivate(financeContext)).toBe(true);
    expect(guard.canActivate(ownerContext)).toBe(true);
  });

  it('should block Agent from contract deletion', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['Owner', 'Finance']);

    const agentContext = createMockContext(['Agent']);
    expect(guard.canActivate(agentContext)).toBe(false);
  });

  it('should block Finance from lead deletion', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['Owner', 'Admin', 'Sales Manager']);

    const financeContext = createMockContext(['Finance']);
    expect(guard.canActivate(financeContext)).toBe(false);
  });

  it('should block Agent from campaigns management', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['Owner', 'Admin', 'Marketing', 'Sales Manager']);

    const agentContext = createMockContext(['Agent']);
    expect(guard.canActivate(agentContext)).toBe(false);
  });

  describe('Granular Permissions (@RequirePermission)', () => {
    function createPermissionMockContext(
      permissions: string[] = [],
      roles: string[] = [],
    ): ExecutionContext {
      return {
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({
            user: {
              id: 'test_user_id',
              email: 'test@example.com',
              roles,
              permissions,
            },
          }),
        }),
      } as unknown as ExecutionContext;
    }

    it('should allow access if user has the required permission', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === 'permissions') return ['leads.manage'];
        return undefined;
      });

      const context = createPermissionMockContext(['leads.manage']);
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny access if user lacks the required permission', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === 'permissions') return ['payments.approve'];
        return undefined;
      });

      const context = createPermissionMockContext(['leads.manage', 'reports.view']);
      expect(guard.canActivate(context)).toBe(false);
    });

    it('should allow access if user matches either permission or role in side-by-side mode', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === 'permissions') return ['campaigns.manage'];
        if (key === 'roles') return ['Owner', 'Marketing'];
        return undefined;
      });

      // User has the role
      const roleMatchContext = createPermissionMockContext([], ['Marketing']);
      expect(guard.canActivate(roleMatchContext)).toBe(true);

      // User has the permission
      const permMatchContext = createPermissionMockContext(['campaigns.manage'], []);
      expect(guard.canActivate(permMatchContext)).toBe(true);

      // User has neither
      const neitherContext = createPermissionMockContext(['other.perm'], ['Agent']);
      expect(guard.canActivate(neitherContext)).toBe(false);
    });
  });
});
