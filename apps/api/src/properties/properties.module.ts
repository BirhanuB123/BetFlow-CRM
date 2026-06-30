import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { PropertiesController } from './properties.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [PropertiesController],
})
export class PropertiesModule {}
