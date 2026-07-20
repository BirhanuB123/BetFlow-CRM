import {
  Body,
  Controller,
  Delete,
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
import type {
  ConvertLeadInput,
  CreateLeadInput,
  UpdateLeadInput,
  UpdateLeadStatusInput,
} from './leads.types';

@UseGuards(JwtAuthGuard)
@Controller('leads')
export class LeadsController {
  constructor(private readonly leads: LeadsService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.leads.list();
  }

  @Get('sources')
  sources(@CurrentUser() user: AuthenticatedUser) {
    return this.leads.listSources();
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateLeadInput,
  ) {
    return this.leads.create(user.id, body);
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: UpdateLeadStatusInput,
  ) {
    return this.leads.updateStatus(user.id, id, body.status);
  }

  @Post(':id/convert')
  convert(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: ConvertLeadInput,
  ) {
    return this.leads.convert(user.id, id, body);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: UpdateLeadInput,
  ) {
    return this.leads.update(user.id, id, body);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.leads.remove(user.id, id);
  }
}
