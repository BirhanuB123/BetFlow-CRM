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
import type { Reservation } from '../database/in-memory.service';

type CreateReservationBody = Omit<Reservation, 'id'>;

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly store: InMemoryService) {}

  @Get()
  list(@Query('tenantId') tenantId?: string) {
    return this.store.listReservations(tenantId);
  }

  @Post()
  create(@Body() body: CreateReservationBody) {
    return this.store.createReservation(body);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: Reservation['status'],
  ) {
    return this.store.updateReservationStatus(id, status);
  }
}
