import { Module } from '@nestjs/common';
import { InMemoryService } from './in-memory.service';
import { PrismaModule } from './prisma.module';
import { RedisCacheService } from './redis-cache.service';

@Module({
  imports: [PrismaModule],
  providers: [InMemoryService, RedisCacheService],
  exports: [InMemoryService, PrismaModule, RedisCacheService],
})
export class DatabaseModule {}
