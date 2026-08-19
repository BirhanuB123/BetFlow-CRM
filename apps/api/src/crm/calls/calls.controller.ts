import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CallsService } from './calls.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../core/auth/auth.types';

@UseGuards(JwtAuthGuard)
@Controller('calls')
export class CallsController {
  constructor(private readonly callsService: CallsService) {}

  @Get('stats')
  getStats() {
    return this.callsService.getStats();
  }

  @Get()
  list(
    @Query('status') status?: string,
    @Query('callType') callType?: string,
    @Query('leadId') leadId?: string,
    @Query('customerId') customerId?: string,
  ) {
    return this.callsService.list({ status, callType, leadId, customerId });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.callsService.get(id);
  }

  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: any,
  ) {
    return this.callsService.create(user.id, body);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.callsService.update(user.id, id, body);
  }

  @Post(':id/complete')
  completeCall(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: { durationSeconds?: number; callResult?: string; notes?: string },
  ) {
    return this.callsService.completeCall(user.id, id, body);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.callsService.remove(user.id, id);
  }
}
