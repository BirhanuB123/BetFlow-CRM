import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { InMemoryService } from '../database/in-memory.service';
import type { Unit, UnitStatus } from '../database/in-memory.service';

type CreateUnitBody = Omit<Unit, 'id'>;

@Controller('units')
export class UnitsController {
  constructor(private readonly store: InMemoryService) {}

  @Get()
  list(
    @Query('tenantId') tenantId?: string,
    @Query('status') status?: UnitStatus,
  ) {
    return this.store.listUnits(tenantId, status);
  }

  @Post()
  create(@Body() body: CreateUnitBody) {
    return this.store.createUnit(body);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: UnitStatus,
    @Body('availableFrom') availableFrom?: string,
  ) {
    return this.store.updateUnitStatus(id, status, availableFrom);
  }
}
