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
});
