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
import type {
  FinanceApproval,
  PaymentScheduleItem,
  PaymentTransaction,
  ReceiptUpload,
} from '../database/in-memory.service';

type CreatePaymentScheduleBody = Omit<PaymentScheduleItem, 'id'>;
type CreatePaymentTransactionBody = Omit<PaymentTransaction, 'id'>;
type CreateReceiptUploadBody = Omit<ReceiptUpload, 'id' | 'uploadedAt'>;
type CreateFinanceApprovalBody = Omit<FinanceApproval, 'id' | 'submittedAt'>;

@Controller('payments')
export class PaymentsController {
  constructor(private readonly store: InMemoryService) {}

  @Get('schedule')
  listSchedule(
    @Query('tenantId') tenantId?: string,
    @Query('reservationId') reservationId?: string,
  ) {
    return this.store.listPaymentSchedule(tenantId, reservationId);
  }

  @Post('schedule')
  createSchedule(@Body() body: CreatePaymentScheduleBody) {
    return this.store.createPaymentScheduleItem(body);
  }

  @Get('transactions')
  listTransactions(
    @Query('tenantId') tenantId?: string,
    @Query('reservationId') reservationId?: string,
  ) {
    return this.store.listPaymentTransactions(tenantId, reservationId);
  }

  @Post('transactions')
  createTransaction(@Body() body: CreatePaymentTransactionBody) {
    return this.store.createPaymentTransaction(body);
  }

  @Get('receipts')
  listReceipts(
    @Query('tenantId') tenantId?: string,
    @Query('paymentId') paymentId?: string,
  ) {
    return this.store.listReceiptUploads(tenantId, paymentId);
  }

  @Post('receipts')
  createReceipt(@Body() body: CreateReceiptUploadBody) {
    return this.store.createReceiptUpload(body);
  }

  @Get('approvals')
  listApprovals(@Query('tenantId') tenantId?: string) {
    return this.store.listFinanceApprovals(tenantId);
  }

  @Post('approvals')
  createApproval(@Body() body: CreateFinanceApprovalBody) {
    return this.store.createFinanceApproval(body);
  }

  @Patch('approvals/:id/status')
  updateApprovalStatus(
    @Param('id') id: string,
    @Body('status') status: FinanceApproval['status'],
    @Body('note') note?: string,
  ) {
    return this.store.updateFinanceApprovalStatus(id, status, note);
  }
}
