import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export type CreateRoleBody = {
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
  name: string;
  description: string | null;
  permissions: RolePermissionResult[];
};

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async listRoles() {
    const roles = await this.prisma.role.findMany({
      where: {},
      orderBy: { name: 'asc' },
      include: {
        permissions: {
          where: {},
          include: {
            permission: true,
          },
        },
      },
    });

    return (roles as RoleResult[]).map((role) => ({
      ...role,
      permissionKeys: role.permissions.map((item) => item.permission.name),
      permissions: role.permissions.map((item) => item.permission),
    }));
  }

  async createRole(input: CreateRoleBody) {
    const permissions = await this.resolvePermissions(input);
    const role = await this.prisma.role.create({
      data: {
        name: input.name,
        description: input.description,
        permissions: {
          create: (permissions as PermissionResult[]).map((permission) => ({
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
        action: 'role.created',
        entityType: 'Role',
        entityId: role.id,
        newValues: {
          name: role.name,
          permissionIds: (permissions as PermissionResult[]).map(
            (permission) => permission.id,
          ),
        },
      },
    });

    return {
      ...(role as RoleResult),
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
          id: { in: input.permissionIds },
        },
      });
    }

    if (input.permissionKeys?.length) {
      return this.prisma.permission.findMany({
        where: {
          name: { in: input.permissionKeys },
        },
      });
    }

    return [];
  }

  async updateRole(
    id: string,
    body: { name?: string; description?: string; permissionKeys?: string[] },
  ) {
    const existing = await this.prisma.role.findFirst({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Role ${id} was not found`);
    }

    const role = await this.prisma.role.update({
      where: { id },
      data: {
        ...(body.name ? { name: body.name } : {}),
        ...(body.description !== undefined
          ? { description: body.description }
          : {}),
      },
    });

    if (body.permissionKeys) {
      const permissions = await this.prisma.permission.findMany({
        where: { name: { in: body.permissionKeys } },
      });
      await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });
      if (permissions.length > 0) {
        await this.prisma.rolePermission.createMany({
          data: permissions.map((p) => ({
            roleId: id,
            permissionId: p.id,
          })),
        });
      }
    }

    await this.prisma.auditLog.create({
      data: {
        action: 'role.updated',
        entityType: 'Role',
        entityId: role.id,
        newValues: {
          name: role.name,
          description: role.description || '',
          permissionKeys: body.permissionKeys,
        },
      },
    });

    return role;
  }

  async deleteRole(id: string) {
    const existing = await this.prisma.role.findFirst({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Role ${id} was not found`);
    }

    // 1. Delete associated permissions
    await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });
    // 2. Delete user role links
    await this.prisma.userRole.deleteMany({ where: { roleId: id } });
    // 3. Delete the role itself
    await this.prisma.role.delete({ where: { id } });

    await this.prisma.auditLog.create({
      data: {
        action: 'role.deleted',
        entityType: 'Role',
        entityId: id,
      },
    });

    return { id, deleted: true };
  }
}
