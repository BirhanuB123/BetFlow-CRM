import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { PermissionsController } from './permissions.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [PermissionsController],
})
export class PermissionsModule {}
