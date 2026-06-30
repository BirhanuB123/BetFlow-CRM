import { Module } from '@nestjs/common';
import { ActivitiesController } from './activities.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ActivitiesController],
})
export class ActivitiesModule {}
