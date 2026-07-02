import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { TenantsService } from '../tenants/tenants.service';

export type CreateRoleBody = {
  tenantId: string;
  name: string;
  description?: string;
  permissionIds?: string[];
  permissionKeys?: string[];
};

type PermissionResult = {
  id: string;
  name: string;
  module: string;
  description: string | null;
};

type RolePermissionResult = {
  permission: PermissionResult;
};

type RoleResult = {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  permissions: RolePermissionResult[];
};

@Injectable()
export class RolesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenants: TenantsService,
  ) {}

  async listRoles(tenantId?: string) {
    if (!tenantId) {
      throw new BadRequestException('tenantId is required');
    }

    const roles = await this.prisma.role.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
      include: {
        permissions: {
          where: { tenantId },
          include: {
            permission: true,
          },
        },
      },
    });

    return (roles as RoleResult[]).map((role) => ({
      ...this.tenants.serializeRole(role),
      permissionKeys: role.permissions.map((item) => item.permission.name),
      permissions: role.permissions.map((item) => item.permission),
    }));
  }

  async createRole(input: CreateRoleBody) {
    if (!input.tenantId) {
      throw new BadRequestException('tenantId is required');
    }

    const permissions = await this.resolvePermissions(input);
    const role = await this.prisma.role.create({
      data: {
        tenantId: input.tenantId,
        name: input.name,
        description: input.description,
        permissions: {
          create: (permissions as PermissionResult[]).map((permission) => ({
            tenantId: input.tenantId,
            permissionId: permission.id,
          })),
        },
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId: input.tenantId,
        action: 'role.created',
        entityType: 'Role',
        entityId: role.id,
        newValues: {
          name: role.name,
          permissionIds: (permissions as PermissionResult[]).map((permission) => permission.id),
        },
      },
    });

    return {
      ...this.tenants.serializeRole(role as RoleResult),
      permissionKeys: (role as RoleResult).permissions.map(
        (item) => item.permission.name,
      ),
      permissions: (role as RoleResult).permissions.map(
        (item) => item.permission,
      ),
    };
  }

  private async resolvePermissions(input: CreateRoleBody) {
    if (input.permissionIds?.length) {
      return this.prisma.permission.findMany({
        where: {
          tenantId: input.tenantId,
          id: { in: input.permissionIds },
        },
      });
    }

    if (input.permissionKeys?.length) {
      return this.prisma.permission.findMany({
        where: {
          tenantId: input.tenantId,
          name: { in: input.permissionKeys },
        },
      });
    }

    return [];
  }
}
