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
import {
  RequirePermission,
  Roles,
} from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { AuthenticatedUser } from '../../core/auth/auth.types';
import type {
  CreateReservationInput,
  UpdateReservationInput,
  UpdateReservationStatusInput,
} from './reservations.types';

@UseGuards(JwtAuthGuard, RolesGuard)
@RequirePermission('reservations.manage')
@Roles('Owner', 'Finance', 'Sales Manager', 'Agent', 'Admin')
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservations: ReservationsService) {}

  @Get()
  list() {
    return this.reservations.list();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.reservations.get(id);
  }

  @Post('process-expirations')
  @Roles('Owner', 'Finance', 'Sales Manager')
  async processExpirations() {
    const count = await this.reservations.processExpiredReservations();
    return { success: true, expiredReservationsCount: count };
  }

  @Post()
  @Roles('Owner', 'Finance', 'Sales Manager', 'Agent')
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateReservationInput,
  ) {
    return this.reservations.create(user.id, body);
  }

  @Patch(':id/status')
  @Roles('Owner', 'Finance', 'Sales Manager', 'Agent')
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: UpdateReservationStatusInput,
  ) {
    return this.reservations.updateStatus(user.id, id, body.status);
  }

  @Patch(':id')
  @Roles('Owner', 'Finance', 'Sales Manager', 'Agent')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: UpdateReservationInput,
  ) {
    return this.reservations.update(user.id, id, body);
  }

  @Delete(':id')
  @Roles('Owner', 'Finance', 'Sales Manager')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.reservations.remove(user.id, id);
  }
}
