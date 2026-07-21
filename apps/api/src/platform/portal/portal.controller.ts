import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../core/auth/auth.types';
import { PortalService } from './portal.service';

@Controller('portal')
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  /**
   * PUBLIC — Portal customer login.
   */
  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  login(@Body() body: { identifier: string }) {
    return this.portalService.login(body.identifier);
  }

  /**
   * PROTECTED — Customer profile, active deals, reserved units, and signed contracts.
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.portalService.getPortalMe(user.email, user.id);
  }

  /**
   * PROTECTED — Payment Schedules & billing statements for customer's unit contracts.
   */
  @UseGuards(JwtAuthGuard)
  @Get('payment-schedules')
  getPaymentSchedules(@CurrentUser() user: AuthenticatedUser) {
    return this.portalService.getPaymentSchedules(user.email, user.id);
  }

  /**
   * PROTECTED — Signed contracts details with schedules and payments.
   */
  @UseGuards(JwtAuthGuard)
  @Get('contracts')
  getContracts(@CurrentUser() user: AuthenticatedUser) {
    return this.portalService.getContracts(user.email, user.id);
  }

  /**
   * PROTECTED — Attached documents for customer or contracts.
   */
  @UseGuards(JwtAuthGuard)
  @Get('documents')
  getDocuments(@CurrentUser() user: AuthenticatedUser) {
    return this.portalService.getDocuments(user.email, user.id);
  }

  /**
   * PROTECTED — Invoices & billing receipts.
   */
  @UseGuards(JwtAuthGuard)
  @Get('invoices')
  getInvoices(@CurrentUser() user: AuthenticatedUser) {
    return this.portalService.getInvoices(user.email, user.id);
  }

  /**
   * PROTECTED — Upload Bank Transfer Receipt Slip.
   */
  @UseGuards(JwtAuthGuard)
  @Post('upload-bank-slip')
  uploadBankSlip(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: any,
  ) {
    return this.portalService.uploadBankSlip(user.id, body);
  }
}
