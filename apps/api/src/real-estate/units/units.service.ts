import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RedisCacheService } from '../../database/redis-cache.service';
import {
  CreateUnitInput,
  UNIT_STATUSES,
  UnitStatus,
  UpdateUnitInput,
} from './units.types';

const unitInclude = {
  floor: {
    select: {
      id: true,
      floorNumber: true,
      name: true,
      building: {
        select: {
          id: true,
          name: true,
          project: {
            select: {
              id: true,
              name: true,
              constructionStage: true,
              progressPercentage: true,
            },
          },
        },
      },
    },
  },
  _count: { select: { deals: true, reservations: true, contracts: true } },
} as const;

@Injectable()
export class UnitsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisCache: RedisCacheService,
  ) {}

  getStageInfo(stage?: string | null, progress?: number | null) {
    const stageMap: Record<
      string,
      { label: string; badge: string; isMilestoneReady: boolean }
    > = {
      EXCAVATION_FOUNDATION: {
        label: 'Foundation & Excavation',
        badge: 'Foundation Stage',
        isMilestoneReady: false,
      },
      STRUCTURE_CONCRETE_SLAB: {
        label: 'Concrete Slab Structure',
        badge: 'Structure Ready',
        isMilestoneReady: true,
      },
      BRICKWORK_PLASTERING: {
        label: 'Brickwork & Plastering',
        badge: 'Masonry Stage',
        isMilestoneReady: true,
      },
      FINISHING_TILING: {
        label: 'Finishing & Tiling',
        badge: 'Finishing Stage',
        isMilestoneReady: true,
      },
      HANDOVER_READY: {
        label: 'Handover & Keys Ready',
        badge: 'Handover Ready',
        isMilestoneReady: true,
      },
    };

    const key = stage || 'STRUCTURE_CONCRETE_SLAB';
    const info = stageMap[key] || {
      label: key,
      badge: key,
      isMilestoneReady: true,
    };

    return {
      stageKey: key,
      label: info.label,
      badge: info.badge,
      isMilestoneReady: info.isMilestoneReady,
      progressPercentage: progress ?? 50,
    };
  }

  async getStackingPlan() {
    const cacheKey = 'units:stacking_plan';
    const cached = await this.redisCache.get<any[]>(cacheKey);
    if (cached) return cached;

    const buildings = await this.prisma.building.findMany({
      include: {
        project: {
          select: {
            id: true,
            name: true,
            constructionStage: true,
            progressPercentage: true,
          },
        },
        floors: {
          include: {
            units: {
              orderBy: { unitNumber: 'asc' },
            },
          },
          orderBy: { floorNumber: 'desc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    const result = buildings.map((b) => {
      const stageInfo = this.getStageInfo(
        b.project?.constructionStage,
        b.project?.progressPercentage,
      );

      return {
        id: b.id,
        name: b.name,
        project: b.project
          ? {
              ...b.project,
              stageInfo,
            }
          : null,
        floors: b.floors.map((f) => ({
          id: f.id,
          floorNumber: f.floorNumber,
          name: f.name,
          units: f.units.map((u) => ({
            id: u.id,
            unitNumber: u.unitNumber,
            type: u.type,
            status: u.status,
            price: u.price,
            area: u.area,
            stageInfo,
          })),
        })),
      };
    });

    await this.redisCache.set(cacheKey, result, 300);
    return result;
  }

  async list(filters: { status?: string; floorId?: string } = {}) {
    const cacheKey = `units:list:${JSON.stringify(filters)}`;
    const cached = await this.redisCache.get<any[]>(cacheKey);
    if (cached) return cached;

    const where: Record<string, unknown> = {};
    if (filters.status) where.status = this.normalizeStatus(filters.status);
    if (filters.floorId) where.floorId = filters.floorId;

    const units = await this.prisma.unit.findMany({
      where,
      include: unitInclude,
      orderBy: { unitNumber: 'asc' },
    });

    const result = units.map((u) => {
      const project = u.floor?.building?.project;
      const stageInfo = this.getStageInfo(
        project?.constructionStage,
        project?.progressPercentage,
      );
      return {
        ...u,
        stageInfo,
      };
    });

    await this.redisCache.set(cacheKey, result, 300);
    return result;
  }

  async get(id: string) {
    const cacheKey = `units:${id}`;
    const cached = await this.redisCache.get<any>(cacheKey);
    if (cached) return cached;

    const unit = await this.prisma.unit.findFirst({
      where: { id },
      include: unitInclude,
    });

    if (!unit) {
      throw new NotFoundException(`Unit ${id} was not found`);
    }

    const project = unit.floor?.building?.project;
    const stageInfo = this.getStageInfo(
      project?.constructionStage,
      project?.progressPercentage,
    );

    const result = {
      ...unit,
      stageInfo,
    };

    await this.redisCache.set(cacheKey, result, 300);
    return result;
  }

  async create(userId: string, input: CreateUnitInput) {
    const unitNumber = input.unitNumber?.trim();
    if (!unitNumber) throw new BadRequestException('unitNumber is required');

    const type = input.type?.trim();
    if (!type) throw new BadRequestException('type is required');

    if (!input.floorId) throw new BadRequestException('floorId is required');
    await this.assertFloorExists(input.floorId);

    const price = this.normalizePrice(input.price);
    const status = this.normalizeStatus(input.status ?? 'AVAILABLE');

    const unit = await this.prisma.unit.create({
      data: {
        floorId: input.floorId,
        unitNumber,
        type,
        status,
        price,
        area: input.area ?? null,
      },
      include: unitInclude,
    });

    await this.recordAudit(userId, 'unit.created', unit.id);
    await this.redisCache.invalidatePattern('units:');
    await this.redisCache.invalidatePattern('projects:');

    return unit;
  }

  async update(userId: string, id: string, input: UpdateUnitInput) {
    const existing = await this.prisma.unit.findFirst({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Unit ${id} was not found`);
    }

    if (input.floorId) {
      await this.assertFloorExists(input.floorId);
    }

    const data: Record<string, unknown> = {};
    if (input.floorId !== undefined) data.floorId = input.floorId;
    if (input.unitNumber !== undefined) {
      const unitNumber = input.unitNumber.trim();
      if (!unitNumber)
        throw new BadRequestException('unitNumber cannot be empty');
      data.unitNumber = unitNumber;
    }
    if (input.type !== undefined) {
      const type = input.type.trim();
      if (!type) throw new BadRequestException('type cannot be empty');
      data.type = type;
    }
    if (input.status !== undefined)
      data.status = this.normalizeStatus(input.status);
    if (input.price !== undefined)
      data.price = this.normalizePrice(input.price);
    if (input.area !== undefined) data.area = input.area ?? null;

    const unit = await this.prisma.unit.update({
      where: { id },
      data,
      include: unitInclude,
    });

    await this.recordAudit(userId, 'unit.updated', unit.id);
    await this.redisCache.invalidatePattern('units:');
    await this.redisCache.invalidatePattern('projects:');

    return unit;
  }

  async updateStatus(userId: string, id: string, status: string) {
    const normalized = this.normalizeStatus(status);
    const existing = await this.prisma.unit.findFirst({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Unit ${id} was not found`);
    }

    const unit = await this.prisma.unit.update({
      where: { id },
      data: { status: normalized },
      include: unitInclude,
    });

    await this.recordAudit(userId, 'unit.status_changed', unit.id, {
      from: existing.status,
      to: normalized,
    });
    await this.redisCache.invalidatePattern('units:');
    await this.redisCache.invalidatePattern('projects:');

    return unit;
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.unit.findFirst({
      where: { id },
      include: {
        _count: {
          select: { deals: true, reservations: true, contracts: true },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException(`Unit ${id} was not found`);
    }

    if (
      existing._count.deals > 0 ||
      existing._count.reservations > 0 ||
      existing._count.contracts > 0
    ) {
      throw new BadRequestException(
        'Cannot delete a unit with linked deals, reservations, or contracts',
      );
    }

    await this.prisma.unit.delete({ where: { id } });
    await this.recordAudit(userId, 'unit.deleted', id);
    await this.redisCache.invalidatePattern('units:');
    await this.redisCache.invalidatePattern('projects:');

    return { id, deleted: true };
  }

  private normalizeStatus(status: string): UnitStatus {
    const upper = status?.trim().toUpperCase();

    if (!UNIT_STATUSES.includes(upper as UnitStatus)) {
      throw new BadRequestException(
        `status must be one of: ${UNIT_STATUSES.join(', ')}`,
      );
    }

    return upper as UnitStatus;
  }

  private normalizePrice(value: number | string): string {
    const parsed = typeof value === 'string' ? Number(value) : value;

    if (value === undefined || value === null || Number.isNaN(parsed)) {
      throw new BadRequestException('price must be a valid number');
    }
    if (parsed < 0) {
      throw new BadRequestException('price cannot be negative');
    }

    return parsed.toFixed(2);
  }

  private async assertFloorExists(floorId: string) {
    const floor = await this.prisma.floor.findFirst({
      where: { id: floorId },
    });

    if (!floor) {
      throw new BadRequestException(`Floor ${floorId} was not found`);
    }
  }

  private recordAudit(
    userId: string,
    action: string,
    entityId: string,
    newValues?: Record<string, string>,
  ) {
    return this.prisma.auditLog.create({
      data: { userId, action, entityType: 'Unit', entityId, newValues },
    });
  }
}
