import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { InMemoryService, Lead } from '../database/in-memory.service';

type CreateLeadBody = Omit<Lead, 'id'>;

@Controller('leads')
export class LeadsController {
  constructor(private readonly store: InMemoryService) {}

  @Get()
  list(@Query('tenantId') tenantId?: string) {
    return this.store.listLeads(tenantId);
  }

  @Post()
  create(@Body() body: CreateLeadBody) {
    return this.store.createLead(body);
  }

  @Patch(':id/assignment')
  assign(
    @Param('id') id: string,
    @Body('assignedToUserId') assignedToUserId: string,
  ) {
    return this.store.assignLead(id, assignedToUserId);
  }
}
