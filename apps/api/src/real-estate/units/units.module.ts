import { Module } from '@nestjs/common';
import { AuthModule } from '../../core/auth/auth.module';
import { DatabaseModule } from '../../database/database.module';
import { InventoryGateway } from './inventory.gateway';
import { UnitsController } from './units.controller';
import { UnitsService } from './units.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [UnitsController],
  providers: [UnitsService, InventoryGateway],
  exports: [UnitsService, InventoryGateway],
})
export class UnitsModule {}
