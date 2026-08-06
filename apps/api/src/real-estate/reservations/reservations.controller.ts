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
import { ReservationsService } from './reservations.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../core/auth/auth.types';
import type {
  CreateReservationInput,
  UpdateReservationInput,
  UpdateReservationStatusInput,
} from './reservations.types';

@UseGuards(JwtAuthGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservations: ReservationsService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.reservations.list();
  }

  @Get(':id')
  get(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.reservations.get(id);
  }

  @Post('process-expirations')
  async processExpirations(@CurrentUser() user: AuthenticatedUser) {
    const count = await this.reservations.processExpiredReservations();
    return { success: true, expiredReservationsCount: count };
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateReservationInput,
  ) {
    return this.reservations.create(user.id, body);
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: UpdateReservationStatusInput,
  ) {
    return this.reservations.updateStatus(user.id, id, body.status);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: UpdateReservationInput,
  ) {
    return this.reservations.update(user.id, id, body);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.reservations.remove(user.id, id);
  }
}
