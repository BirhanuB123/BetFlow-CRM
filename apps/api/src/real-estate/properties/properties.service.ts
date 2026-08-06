import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
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

  async listBuildings(projectId?: string) {
    const buildings = await this.prisma.building.findMany({
      where: { ...(projectId ? { projectId } : {}) },
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
          where: { floor: { buildingId: building.id } },
        }),
      })),
    );
  }

  async getBuilding(id: string) {
    const building = await this.prisma.building.findFirst({
      where: { id },
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

  async createBuilding(userId: string, input: CreateBuildingInput) {
    const name = input.name?.trim();
    if (!name) throw new BadRequestException('name is required');
    if (!input.projectId)
      throw new BadRequestException('projectId is required');
    await this.assertProjectExists(input.projectId);

    const building = await this.prisma.building.create({
      data: {
        projectId: input.projectId,
        name,
        floorsCount: this.normalizeCount(input.floorsCount, 'floorsCount', 1),
      },
      include: {
        project: { select: { id: true, name: true } },
        _count: { select: { floors: true } },
      },
    });

    await this.recordAudit(userId, 'building.created', building.id);
    return building;
  }

  async updateBuilding(userId: string, id: string, input: UpdateBuildingInput) {
    const existing = await this.prisma.building.findFirst({
      where: { id },
    });
    if (!existing) throw new NotFoundException(`Building ${id} was not found`);

    const data: Record<string, unknown> = {};
    if (input.name !== undefined) {
      const name = input.name.trim();
      if (!name) throw new BadRequestException('name cannot be empty');
      data.name = name;
    }
    if (input.floorsCount !== undefined)
      data.floorsCount = this.normalizeCount(
        input.floorsCount,
        'floorsCount',
        1,
      );

    const building = await this.prisma.building.update({
      where: { id },
      data,
      include: {
        project: { select: { id: true, name: true } },
        _count: { select: { floors: true } },
      },
    });

    await this.recordAudit(userId, 'building.updated', building.id);
    return building;
  }

  async removeBuilding(userId: string, id: string) {
    const existing = await this.prisma.building.findFirst({
      where: { id },
      include: { _count: { select: { floors: true } } },
    });
    if (!existing) throw new NotFoundException(`Building ${id} was not found`);

    if (existing._count.floors > 0) {
      throw new BadRequestException(
        'Cannot delete a building that still has floors',
      );
    }

    await this.prisma.building.delete({ where: { id } });
    await this.recordAudit(userId, 'building.deleted', id);
    return { id, deleted: true };
  }

  // ---- Floors --------------------------------------------------------------

  listFloors(buildingId?: string) {
    return this.prisma.floor.findMany({
      where: { ...(buildingId ? { buildingId } : {}) },
      include: {
        building: { select: { id: true, name: true } },
        _count: { select: { units: true } },
      },
      orderBy: { floorNumber: 'asc' },
    });
  }

  async createFloor(userId: string, input: CreateFloorInput) {
    if (!input.buildingId)
      throw new BadRequestException('buildingId is required');
    await this.assertBuildingExists(input.buildingId);

    const floor = await this.prisma.floor.create({
      data: {
        buildingId: input.buildingId,
        floorNumber: this.normalizeCount(input.floorNumber, 'floorNumber', 0),
        name: input.name?.trim() || null,
      },
      include: {
        building: { select: { id: true, name: true } },
        _count: { select: { units: true } },
      },
    });

    await this.recordAudit(userId, 'floor.created', floor.id);
    return floor;
  }

  async updateFloor(userId: string, id: string, input: UpdateFloorInput) {
    const existing = await this.prisma.floor.findFirst({
      where: { id },
    });
    if (!existing) throw new NotFoundException(`Floor ${id} was not found`);

    const data: Record<string, unknown> = {};
    if (input.floorNumber !== undefined)
      data.floorNumber = this.normalizeCount(
        input.floorNumber,
        'floorNumber',
        0,
      );
    if (input.name !== undefined) data.name = input.name?.trim() || null;

    const floor = await this.prisma.floor.update({
      where: { id },
      data,
      include: {
        building: { select: { id: true, name: true } },
        _count: { select: { units: true } },
      },
    });

    await this.recordAudit(userId, 'floor.updated', floor.id);
    return floor;
  }

  async removeFloor(userId: string, id: string) {
    const existing = await this.prisma.floor.findFirst({
      where: { id },
      include: { _count: { select: { units: true } } },
    });
    if (!existing) throw new NotFoundException(`Floor ${id} was not found`);

    if (existing._count.units > 0) {
      throw new BadRequestException(
        'Cannot delete a floor that still has units',
      );
    }

    await this.prisma.floor.delete({ where: { id } });
    await this.recordAudit(userId, 'floor.deleted', id);
    return { id, deleted: true };
  }

  // ---- helpers -------------------------------------------------------------

  private normalizeCount(
    value: number | undefined,
    field: string,
    min: number,
  ) {
    const n = value ?? min;
    if (!Number.isInteger(n) || n < min) {
      throw new BadRequestException(`${field} must be an integer >= ${min}`);
    }
    return n;
  }

  private async assertProjectExists(projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId },
      select: { id: true },
    });
    if (!project)
      throw new BadRequestException(`Project ${projectId} was not found`);
  }

  private async assertBuildingExists(buildingId: string) {
    const building = await this.prisma.building.findFirst({
      where: { id: buildingId },
      select: { id: true },
    });
    if (!building)
      throw new BadRequestException(`Building ${buildingId} was not found`);
  }

  private recordAudit(userId: string, action: string, entityId: string) {
    return this.prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType: action.startsWith('building') ? 'Building' : 'Floor',
        entityId,
      },
    });
  }
}
