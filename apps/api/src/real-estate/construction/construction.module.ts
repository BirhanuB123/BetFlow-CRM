import { Module } from '@nestjs/common';
import { AuthModule } from '../../core/auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { ConstructionController } from './construction.controller';
import { ConstructionService } from './construction.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [ConstructionController],
  providers: [ConstructionService],
  exports: [ConstructionService],
})
export class ConstructionModule {}
