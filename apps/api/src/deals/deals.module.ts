import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { DealsController } from './deals.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [DealsController],
})
export class DealsModule {}
