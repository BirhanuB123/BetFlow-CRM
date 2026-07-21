import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateProjectInput,
  PROJECT_STATUSES,
  ProjectStatus,
  UpdateProjectInput,
} from './projects.types';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const projects = await this.prisma.project.findMany({
      where: {},
      include: { _count: { select: { buildings: true } } },
      orderBy: { name: 'asc' },
    });

    return Promise.all(
      projects.map(async (project) => ({
        ...project,
        unitsCount: await this.prisma.unit.count({
          where: { floor: { building: { projectId: project.id } } },
        }),
      })),
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

    const unitsCount = await this.prisma.unit.count({
      where: { floor: { building: { projectId: id } } },
    });

    return { ...project, buildings, unitsCount };
  }

  async create(userId: string, input: CreateProjectInput) {
    const name = input.name?.trim();
    if (!name) throw new BadRequestException('name is required');

    const project = await this.prisma.project.create({
      data: {
        name,
        description: input.description?.trim() || null,
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
    if (input.status !== undefined)
      data.status = this.normalizeStatus(input.status);

    const project = await this.prisma.project.update({
      where: { id },
      data,
      include: { _count: { select: { buildings: true } } },
    });

    await this.recordAudit(userId, 'project.updated', project.id);

    return project;
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.project.findFirst({
      where: { id },
      include: { _count: { select: { buildings: true } } },
    });
    if (!existing) throw new NotFoundException(`Project ${id} was not found`);

    if (existing._count.buildings > 0) {
      throw new BadRequestException(
        'Cannot delete a project that still has buildings',
      );
    }

    await this.prisma.project.delete({ where: { id } });
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

  private recordAudit(userId: string, action: string, entityId: string) {
    return this.prisma.auditLog.create({
      data: { userId, action, entityType: 'Project', entityId },
    });
  }
}
