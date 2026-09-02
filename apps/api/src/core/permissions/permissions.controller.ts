import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { InMemoryService } from '../../database/in-memory.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly store: InMemoryService,
  ) {}

  @Get()
  async list() {
    const dbPermissions = await this.prisma.permission.findMany({
      orderBy: { module: 'asc' },
    });

    if (dbPermissions.length > 0) {
      return dbPermissions.map((p) => ({
        key: p.name,
        label: p.description || p.name,
        group: p.module,
      }));
    }

    return this.store.listPermissions();
  }
}
