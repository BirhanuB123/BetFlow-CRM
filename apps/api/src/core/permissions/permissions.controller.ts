import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { InMemoryService } from '../../database/in-memory.service';

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
