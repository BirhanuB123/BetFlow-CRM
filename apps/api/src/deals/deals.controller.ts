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
import type { Deal, LeadStage } from '../database/in-memory.service';

type CreateDealBody = Omit<Deal, 'id'>;

@Controller('deals')
export class DealsController {
  constructor(private readonly store: InMemoryService) {}

  @Get()
  list(@Query('tenantId') tenantId?: string) {
    return this.store.listDeals(tenantId);
  }

  @Post()
  create(@Body() body: CreateDealBody) {
    return this.store.createDeal(body);
  }

  @Patch(':id/stage')
  move(@Param('id') id: string, @Body('stage') stage: string) {
    return this.store.moveDeal(id, stage as LeadStage);
  }
}
