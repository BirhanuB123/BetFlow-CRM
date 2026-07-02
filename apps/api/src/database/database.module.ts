import { Module } from '@nestjs/common';
import { InMemoryService } from './in-memory.service';
import { PrismaModule } from './prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [InMemoryService],
  exports: [InMemoryService, PrismaModule],
})
export class DatabaseModule {}
