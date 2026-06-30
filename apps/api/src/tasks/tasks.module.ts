import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { TasksController } from './tasks.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [TasksController],
})
export class TasksModule {}
