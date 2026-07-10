import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  CreateBuildingInput,
  CreateFloorInput,
  UpdateBuildingInput,
  UpdateFloorInput,
} from './properties.types';

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  // ---- Buildings -----------------------------------------------------------

  async listBuildings(tenantId: string, projectId?: string) {
    const buildings = await this.prisma.building.findMany({
      where: { tenantId, ...(projectId ? { projectId } : {}) },
      include: {
        project: { select: { id: true, name: true } },
        _count: { select: { floors: true } },
      },
      orderBy: { name: 'asc' },
    });

    return Promise.all(
      buildings.map(async (building) => ({
        ...building,
        unitsCount: await this.prisma.unit.count({
          where: { tenantId, floor: { buildingId: building.id } },
        }),
      })),
    );
  }

  async getBuilding(tenantId: string, id: string) {
    const building = await this.prisma.building.findFirst({
      where: { id, tenantId },
      include: {
        project: { select: { id: true, name: true } },
        floors: {
          include: { _count: { select: { units: true } } },
          orderBy: { floorNumber: 'asc' },
        },
      },
    });
    if (!building) throw new NotFoundException(`Building ${id} was not found`);
    return building;
  }

  async createBuilding(
    tenantId: string,
    userId: string,
    input: CreateBuildingInput,
  ) {
    const name = input.name?.trim();
    if (!name) throw new BadRequestException('name is required');
    if (!input.projectId) throw new BadRequestException('projectId is required');
    await this.assertProjectBelongsToTenant(tenantId, input.projectId);

    const building = await this.prisma.building.create({
      data: {
        tenantId,
        projectId: input.projectId,
        name,
        floorsCount: this.normalizeCount(input.floorsCount, 'floorsCount', 1),
      },
      include: {
        project: { select: { id: true, name: true } },
        _count: { select: { floors: true } },
      },
    });

    await this.recordAudit(tenantId, userId, 'building.created', building.id);
    return building;
  }

  async updateBuilding(
    tenantId: string,
    userId: string,
    id: string,
    input: UpdateBuildingInput,
  ) {
    const existing = await this.prisma.building.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new NotFoundException(`Building ${id} was not found`);

    const data: Record<string, unknown> = {};
    if (input.name !== undefined) {
      const name = input.name.trim();
      if (!name) throw new BadRequestException('name cannot be empty');
      data.name = name;
    }
    if (input.floorsCount !== undefined)
      data.floorsCount = this.normalizeCount(input.floorsCount, 'floorsCount', 1);

    const building = await this.prisma.building.update({
      where: { id },
      data,
      include: {
        project: { select: { id: true, name: true } },
        _count: { select: { floors: true } },
      },
    });

    await this.recordAudit(tenantId, userId, 'building.updated', building.id);
    return building;
  }

  async removeBuilding(tenantId: string, userId: string, id: string) {
    const existing = await this.prisma.building.findFirst({
      where: { id, tenantId },
      include: { _count: { select: { floors: true } } },
    });
    if (!existing) throw new NotFoundException(`Building ${id} was not found`);

    if (existing._count.floors > 0) {
      throw new BadRequestException(
        'Cannot delete a building that still has floors',
      );
    }

    await this.prisma.building.delete({ where: { id } });
    await this.recordAudit(tenantId, userId, 'building.deleted', id);
    return { id, deleted: true };
  }

  // ---- Floors --------------------------------------------------------------

  listFloors(tenantId: string, buildingId?: string) {
    return this.prisma.floor.findMany({
      where: { tenantId, ...(buildingId ? { buildingId } : {}) },
      include: {
        building: { select: { id: true, name: true } },
        _count: { select: { units: true } },
      },
      orderBy: { floorNumber: 'asc' },
    });
  }

  async createFloor(
    tenantId: string,
    userId: string,
    input: CreateFloorInput,
  ) {
    if (!input.buildingId)
      throw new BadRequestException('buildingId is required');
    await this.assertBuildingBelongsToTenant(tenantId, input.buildingId);

    const floor = await this.prisma.floor.create({
      data: {
        tenantId,
        buildingId: input.buildingId,
        floorNumber: this.normalizeCount(input.floorNumber, 'floorNumber', 0),
        name: input.name?.trim() || null,
      },
      include: {
        building: { select: { id: true, name: true } },
        _count: { select: { units: true } },
      },
    });

    await this.recordAudit(tenantId, userId, 'floor.created', floor.id);
    return floor;
  }

  async updateFloor(
    tenantId: string,
    userId: string,
    id: string,
    input: UpdateFloorInput,
  ) {
    const existing = await this.prisma.floor.findFirst({
      where: { id, tenantId },
    });
    if (!existing) throw new NotFoundException(`Floor ${id} was not found`);

    const data: Record<string, unknown> = {};
    if (input.floorNumber !== undefined)
      data.floorNumber = this.normalizeCount(input.floorNumber, 'floorNumber', 0);
    if (input.name !== undefined) data.name = input.name?.trim() || null;

    const floor = await this.prisma.floor.update({
      where: { id },
      data,
      include: {
        building: { select: { id: true, name: true } },
        _count: { select: { units: true } },
      },
    });

    await this.recordAudit(tenantId, userId, 'floor.updated', floor.id);
    return floor;
  }

  async removeFloor(tenantId: string, userId: string, id: string) {
    const existing = await this.prisma.floor.findFirst({
      where: { id, tenantId },
      include: { _count: { select: { units: true } } },
    });
    if (!existing) throw new NotFoundException(`Floor ${id} was not found`);

    if (existing._count.units > 0) {
      throw new BadRequestException(
        'Cannot delete a floor that still has units',
      );
    }

    await this.prisma.floor.delete({ where: { id } });
    await this.recordAudit(tenantId, userId, 'floor.deleted', id);
    return { id, deleted: true };
  }

  // ---- helpers -------------------------------------------------------------

  private normalizeCount(value: number | undefined, field: string, min: number) {
    const n = value ?? min;
    if (!Number.isInteger(n) || n < min) {
      throw new BadRequestException(`${field} must be an integer >= ${min}`);
    }
    return n;
  }

  private async assertProjectBelongsToTenant(
    tenantId: string,
    projectId: string,
  ) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, tenantId },
      select: { id: true },
    });
    if (!project) throw new BadRequestException(`Project ${projectId} was not found`);
  }

  private async assertBuildingBelongsToTenant(
    tenantId: string,
    buildingId: string,
  ) {
    const building = await this.prisma.building.findFirst({
      where: { id: buildingId, tenantId },
      select: { id: true },
    });
    if (!building)
      throw new BadRequestException(`Building ${buildingId} was not found`);
  }

  private recordAudit(
    tenantId: string,
    userId: string,
    action: string,
    entityId: string,
  ) {
    return this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action,
        entityType: action.startsWith('building') ? 'Building' : 'Floor',
        entityId,
      },
    });
  }
}