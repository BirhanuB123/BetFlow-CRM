import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async checkHealth() {
    let dbStatus = 'connected';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'disconnected';
    }

    let storageStatus = 'ready';
    try {
      const fs = await import('fs');
      if (!fs.existsSync('./uploads')) {
        fs.mkdirSync('./uploads', { recursive: true });
      }
    } catch {
      storageStatus = 'error';
    }

    const memoryUsage = process.memoryUsage();

    return {
      status:
        dbStatus === 'connected' && storageStatus === 'ready'
          ? 'ok'
          : 'degraded',
      service: 'betflow-api',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: dbStatus,
      storage: storageStatus,
      memory: {
        rssMb: Math.round((memoryUsage.rss / 1024 / 1024) * 100) / 100,
        heapTotalMb:
          Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100,
        heapUsedMb:
          Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
      },
    };
  }
}
