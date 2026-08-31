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
import { PaymentsService } from './payments.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  RequirePermission,
  Roles,
} from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { AuthenticatedUser } from '../../core/auth/auth.types';
import { PaymentPlanService } from './payment-plan.service';
import type { CreatePaymentInput, UpdatePaymentInput } from './payments.types';
import type { PaymentPlanInput } from '@betflow/shared';

@UseGuards(JwtAuthGuard, RolesGuard)
@RequirePermission('payments.approve')
@Roles('Owner', 'Finance', 'Sales Manager', 'Admin', 'Agent')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly payments: PaymentsService,
    private readonly planService: PaymentPlanService,
  ) {}

  @Post('calculate-plan')
  calculatePlan(@Body() body: PaymentPlanInput) {
    return this.planService.calculatePaymentPlan(body);
  }

  @Get('schedules')
  listSchedules() {
    return this.payments.listSchedules();
  }

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.payments.list();
  }

  @Get(':id')
  get(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.payments.get(id);
  }

  @Post()
  @Roles('Owner', 'Finance')
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreatePaymentInput,
  ) {
    return this.payments.create(user.id, body);
  }

  @Patch(':id')
  @Roles('Owner', 'Finance')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: UpdatePaymentInput,
  ) {
    return this.payments.update(user.id, id, body);
  }

  @Delete(':id')
  @Roles('Owner', 'Finance')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.payments.remove(user.id, id);
  }
}
