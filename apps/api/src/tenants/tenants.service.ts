import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PasswordService } from '../auth/password.service';
import { PrismaService } from '../database/prisma.service';

export type RegisterTenantBody = {
  companyName: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  password?: string;
  region?: string;
  plan?: string;
};

export type UpdateTenantBody = {
  name?: string;
  domain?: string;
};

type TenantListResult = {
  id: string;
  name: string;
  domain: string | null;
  createdAt: Date;
  updatedAt: Date;
  users: { id: string }[];
  subscriptions: { planName: string }[];
};

@Injectable()
export class TenantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
  ) {}

  async registerTenant(input: RegisterTenantBody) {
    this.assertTenantRegistration(input);

    const domain = input.slug.trim().toLowerCase();
    const ownerEmail = input.ownerEmail.trim().toLowerCase();
    const ownerName = this.splitName(input.ownerName);
    const passwordHash = await this.passwords.hash(input.password as string);

    try {
      return await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const tenant = await tx.tenant.create({
          data: {
            name: input.companyName.trim(),
            domain,
          },
        });
        const ownerRole = await tx.role.create({
          data: {
            tenantId: tenant.id,
            name: 'Owner',
            description: 'Full tenant administration access.',
          },
        });
        const owner = await tx.user.create({
          data: {
            tenantId: tenant.id,
            email: ownerEmail,
            password: passwordHash,
            firstName: ownerName.firstName,
            lastName: ownerName.lastName,
            roles: {
              create: {
                tenantId: tenant.id,
                roleId: ownerRole.id,
              },
            },
          },
          include: this.userInclude,
        });

        await tx.subscription.create({
          data: {
            tenantId: tenant.id,
            planName: input.plan ?? 'Starter',
            startDate: new Date(),
            status: 'ACTIVE',
          },
        });
        await tx.auditLog.create({
          data: {
            tenantId: tenant.id,
            userId: owner.id,
            action: 'tenant.registered',
            entityType: 'Tenant',
            entityId: tenant.id,
            newValues: {
              companyName: tenant.name,
              slug: domain,
              region: input.region ?? null,
              plan: input.plan ?? 'Starter',
            },
          },
        });

        return {
          tenant: this.serializeTenant(tenant),
          owner: this.serializeUser(owner),
          roles: [this.serializeRole(ownerRole)],
        };
      });
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Tenant slug or owner email already exists');
      }

      throw error;
    }
  }

  async listTenants() {
    const tenants = await this.prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        subscriptions: {
          orderBy: { startDate: 'desc' },
          take: 1,
        },
        users: {
          where: { roles: { some: { role: { name: 'Owner' } } } },
          take: 1,
        },
      },
    });

    return (tenants as TenantListResult[]).map((tenant) =>
      this.serializeTenant({
        ...tenant,
        ownerUserId: tenant.users[0]?.id,
        plan: tenant.subscriptions[0]?.planName,
      }),
    );
  }

  async getTenant(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        subscriptions: {
          orderBy: { startDate: 'desc' },
          take: 1,
        },
        users: {
          where: { roles: { some: { role: { name: 'Owner' } } } },
          take: 1,
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant ${id} was not found`);
    }

    return this.serializeTenant({
      ...tenant,
      ownerUserId: tenant.users[0]?.id,
      plan: tenant.subscriptions[0]?.planName,
    });
  }

  async updateTenant(authenticatedTenantId: string, id: string, input: UpdateTenantBody) {
    if (authenticatedTenantId !== id) {
      throw new ForbiddenException('Tenant settings can only be changed for the authenticated tenant');
    }

    await this.getTenant(id);

    const tenant = await this.prisma.tenant.update({
      where: { id },
      data: {
        name: input.name,
        domain: input.domain,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId: id,
        action: 'tenant.updated',
        entityType: 'Tenant',
        entityId: id,
        newValues: input,
      },
    });

    return this.serializeTenant(tenant);
  }

  serializeUser(user: User & { roles?: { role: { id: string; name: string } }[] }) {
    const primaryRole = user.roles?.[0]?.role;

    return {
      id: user.id,
      tenantId: user.tenantId,
      name: [user.firstName, user.lastName].filter(Boolean).join(' '),
      email: user.email,
      roleId: primaryRole?.id,
      roleName: primaryRole?.name,
      status: user.isActive ? 'active' : 'inactive',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  serializeRole(role: { id: string; tenantId: string; name: string; description: string | null }) {
    return {
      id: role.id,
      tenantId: role.tenantId,
      name: role.name,
      description: role.description,
    };
  }

  private assertTenantRegistration(input: RegisterTenantBody) {
    if (!input.companyName?.trim()) {
      throw new BadRequestException('companyName is required');
    }

    if (!input.slug?.trim()) {
      throw new BadRequestException('slug is required');
    }

    if (!input.ownerName?.trim()) {
      throw new BadRequestException('ownerName is required');
    }

    if (!input.ownerEmail?.trim()) {
      throw new BadRequestException('ownerEmail is required');
    }

    if (!input.password || input.password.length < 8) {
      throw new BadRequestException('password must be at least 8 characters');
    }
  }

  private splitName(name: string) {
    const parts = name.trim().split(/\s+/);
    const firstName = parts.shift() ?? 'Owner';
    const lastName = parts.join(' ') || 'User';

    return { firstName, lastName };
  }

  private serializeTenant(tenant: {
    id: string;
    name: string;
    domain: string | null;
    createdAt: Date;
    updatedAt: Date;
    ownerUserId?: string;
    plan?: string;
  }) {
    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.domain,
      domain: tenant.domain,
      region: 'US East',
      plan: tenant.plan ?? 'Starter',
      status: 'active',
      ownerUserId: tenant.ownerUserId,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    };
  }

  private isUniqueViolation(error: unknown) {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    );
  }

  private readonly userInclude = {
    roles: {
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    },
  } satisfies Prisma.UserInclude;
}
