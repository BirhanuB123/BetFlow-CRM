import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EthioTelecomSmsService } from '../../integrations/sms.service';
import {
  CreateProjectInput,
  PROJECT_STATUSES,
  ProjectStatus,
  UpdateProjectInput,
} from './projects.types';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly smsService: EthioTelecomSmsService,
  ) {}

  async list() {
    const projects = await this.prisma.project.findMany({
      where: {},
      include: { _count: { select: { buildings: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(
      projects.map(async (project) => {
        const units = await this.prisma.unit.findMany({
          where: { floor: { building: { projectId: project.id } } },
          select: { status: true, price: true },
        });

        const unitsCount = units.length;
        const availableUnitsCount = units.filter(
          (u) => u.status === 'AVAILABLE',
        ).length;
        const reservedUnitsCount = units.filter(
          (u) => u.status === 'RESERVED',
        ).length;
        const soldUnitsCount = units.filter((u) => u.status === 'SOLD').length;
        const totalValueETB = units.reduce(
          (acc, u) => acc + (Number(u.price) || 0),
          0,
        );

        return {
          ...project,
          unitsCount,
          availableUnitsCount,
          reservedUnitsCount,
          soldUnitsCount,
          totalValueETB,
        };
      }),
    );
  }

  async get(id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id },
      include: {
        buildings: {
          include: { _count: { select: { floors: true } } },
          orderBy: { name: 'asc' },
        },
        _count: { select: { buildings: true } },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project ${id} was not found`);
    }

    const buildings = await Promise.all(
      project.buildings.map(async (building) => ({
        ...building,
        unitsCount: await this.prisma.unit.count({
          where: { floor: { buildingId: building.id } },
        }),
      })),
    );

    const units = await this.prisma.unit.findMany({
      where: { floor: { building: { projectId: id } } },
      select: { status: true, price: true },
    });

    const unitsCount = units.length;
    const availableUnitsCount = units.filter(
      (u) => u.status === 'AVAILABLE',
    ).length;
    const reservedUnitsCount = units.filter(
      (u) => u.status === 'RESERVED',
    ).length;
    const soldUnitsCount = units.filter((u) => u.status === 'SOLD').length;
    const totalValueETB = units.reduce(
      (acc, u) => acc + (Number(u.price) || 0),
      0,
    );

    return {
      ...project,
      buildings,
      unitsCount,
      availableUnitsCount,
      reservedUnitsCount,
      soldUnitsCount,
      totalValueETB,
    };
  }

  async create(userId: string, input: CreateProjectInput) {
    const name = input.name?.trim();
    if (!name) throw new BadRequestException('name is required');

    const project = await this.prisma.project.create({
      data: {
        name,
        description: input.description?.trim() || null,
        category: input.category || 'RESIDENTIAL_TOWER',
        location: input.location?.trim() || null,
        subCity: input.subCity || 'BOLE',
        constructionStage: input.constructionStage || 'STRUCTURE_CONCRETE_SLAB',
        progressPercentage:
          input.progressPercentage != null
            ? Number(input.progressPercentage)
            : 50,
        estimatedDelivery: input.estimatedDelivery?.trim() || null,
        coverImage: input.coverImage?.trim() || null,
        gallery: input.gallery || [],
        videoUrl: input.videoUrl?.trim() || null,
        amenities: input.amenities || [],
        totalAreaSqm:
          input.totalAreaSqm != null ? Number(input.totalAreaSqm) : null,
        avgPricePerSqm:
          input.avgPricePerSqm != null ? Number(input.avgPricePerSqm) : null,
        status: this.normalizeStatus(input.status ?? 'ACTIVE'),
      },
      include: { _count: { select: { buildings: true } } },
    });

    await this.recordAudit(userId, 'project.created', project.id);

    return project;
  }

  async update(userId: string, id: string, input: UpdateProjectInput) {
    const existing = await this.prisma.project.findFirst({
      where: { id },
    });
    if (!existing) throw new NotFoundException(`Project ${id} was not found`);

    const data: Record<string, unknown> = {};
    if (input.name !== undefined) {
      const name = input.name.trim();
      if (!name) throw new BadRequestException('name cannot be empty');
      data.name = name;
    }
    if (input.description !== undefined)
      data.description = input.description?.trim() || null;
    if (input.category !== undefined) data.category = input.category;
    if (input.location !== undefined)
      data.location = input.location?.trim() || null;
    if (input.subCity !== undefined) data.subCity = input.subCity || null;
    if (input.constructionStage !== undefined)
      data.constructionStage = input.constructionStage;
    if (input.progressPercentage !== undefined)
      data.progressPercentage = Number(input.progressPercentage);
    if (input.estimatedDelivery !== undefined)
      data.estimatedDelivery = input.estimatedDelivery?.trim() || null;
    if (input.coverImage !== undefined)
      data.coverImage = input.coverImage?.trim() || null;
    if (input.gallery !== undefined) data.gallery = input.gallery;
    if (input.videoUrl !== undefined)
      data.videoUrl = input.videoUrl?.trim() || null;
    if (input.amenities !== undefined) data.amenities = input.amenities;
    if (input.totalAreaSqm !== undefined)
      data.totalAreaSqm =
        input.totalAreaSqm != null ? Number(input.totalAreaSqm) : null;
    if (input.avgPricePerSqm !== undefined)
      data.avgPricePerSqm =
        input.avgPricePerSqm != null ? Number(input.avgPricePerSqm) : null;
    if (input.status !== undefined)
      data.status = this.normalizeStatus(input.status);

    const project = await this.prisma.project.update({
      where: { id },
      data,
      include: { _count: { select: { buildings: true } } },
    });

    if (
      existing.constructionStage !== project.constructionStage &&
      project.constructionStage
    ) {
      try {
        const units = await this.prisma.unit.findMany({
          where: { floor: { building: { projectId: project.id } } },
          select: { id: true, unitNumber: true },
        });

        const unitIds = units.map((u) => u.id);
        const activeContracts = await this.prisma.contract.findMany({
          where: { unitId: { in: unitIds }, status: 'ACTIVE' },
          include: {
            customer: true,
            unit: true,
            schedules: { where: { status: 'PENDING' } },
          },
        });

        const newDueDate = new Date();
        newDueDate.setDate(newDueDate.getDate() + 30); // 30-day milestone payment window

        for (const contract of activeContracts) {
          const matchingSchedule =
            contract.schedules.find((s) =>
              s.milestoneName
                .toLowerCase()
                .includes(project.constructionStage.toLowerCase().slice(0, 5)),
            ) || contract.schedules[0];

          if (matchingSchedule) {
            await this.prisma.paymentSchedule.update({
              where: { id: matchingSchedule.id },
              data: {
                dueDate: newDueDate,
                status: 'PENDING',
              },
            });

            const customerName = `${contract.customer.firstName} ${contract.customer.lastName}`;
            const customerPhone = contract.customer.phone || '0911000000';
            const smsBody = `Selam ${customerName}! Construction on ${project.name} reached milestone '${project.constructionStage.replace(/_/g, ' ')}'. Milestone payment for Unit ${contract.unit.unitNumber} is due on ${newDueDate.toLocaleDateString()}. CBE Acc: 1000123456789.`;

            await this.smsService.sendSms({
              recipientName: customerName,
              recipientPhone: customerPhone,
              body: smsBody,
              triggerType: 'PAYMENT_DUE_ALERT',
              customerId: contract.customerId,
            });

            await this.prisma.notification.create({
              data: {
                userId: userId,
                title: `🏗️ Construction Milestone Payment Triggered (${project.name})`,
                message: `Milestone '${project.constructionStage}' reached. Customer ${customerName} (Unit ${contract.unit.unitNumber}) notified of payment due date ${newDueDate.toLocaleDateString()}.`,
              },
            });
          }
        }
      } catch {
        // Non-blocking trigger
      }
    }

    await this.recordAudit(userId, 'project.updated', project.id, {
      ...(existing.constructionStage !== project.constructionStage
        ? {
            stageChangedFrom: existing.constructionStage,
            stageChangedTo: project.constructionStage,
          }
        : {}),
      ...(existing.progressPercentage !== project.progressPercentage
        ? {
            progressChangedFrom: String(existing.progressPercentage),
            progressChangedTo: String(project.progressPercentage),
          }
        : {}),
    });

    return project;
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.project.findFirst({
      where: { id },
      include: { buildings: { select: { id: true } } },
    });
    if (!existing) throw new NotFoundException(`Project ${id} was not found`);

    const buildingIds = existing.buildings.map((b) => b.id);
    const floors = await this.prisma.floor.findMany({
      where: { buildingId: { in: buildingIds } },
      select: { id: true },
    });
    const floorIds = floors.map((f) => f.id);

    await this.prisma.$transaction([
      this.prisma.unit.deleteMany({ where: { floorId: { in: floorIds } } }),
      this.prisma.floor.deleteMany({
        where: { buildingId: { in: buildingIds } },
      }),
      this.prisma.building.deleteMany({ where: { projectId: id } }),
      this.prisma.project.delete({ where: { id } }),
    ]);

    await this.recordAudit(userId, 'project.deleted', id);

    return { id, deleted: true };
  }

  private normalizeStatus(status: string): ProjectStatus {
    const upper = status?.trim().toUpperCase().replace(/\s+/g, '_');
    if (!PROJECT_STATUSES.includes(upper as ProjectStatus)) {
      throw new BadRequestException(
        `status must be one of: ${PROJECT_STATUSES.join(', ')}`,
      );
    }
    return upper as ProjectStatus;
  }

  private recordAudit(
    userId: string,
    action: string,
    entityId: string,
    newValues?: Record<string, string>,
  ) {
    return this.prisma.auditLog.create({
      data: { userId, action, entityType: 'Project', entityId, newValues },
    });
  }
}
