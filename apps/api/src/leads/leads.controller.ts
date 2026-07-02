import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import type { CreateLeadInput, UpdateLeadStatusInput } from './leads.types';

@UseGuards(JwtAuthGuard)
@Controller('leads')
export class LeadsController {
  constructor(private readonly leads: LeadsService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.leads.list(user.tenantId);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateLeadInput,
  ) {
    return this.leads.create(user.tenantId, user.id, body);
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: UpdateLeadStatusInput,
  ) {
    return this.leads.updateStatus(user.tenantId, user.id, id, body.status);
  }
}
