import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Customer, InMemoryService } from '../database/in-memory.service';

type CreateCustomerBody = Omit<Customer, 'id'>;

@Controller('customers')
export class CustomersController {
  constructor(private readonly store: InMemoryService) {}

  @Get()
  list(@Query('tenantId') tenantId?: string) {
    return this.store.listCustomers(tenantId);
  }

  @Post()
  create(@Body() body: CreateCustomerBody) {
    return this.store.createCustomer(body);
  }
}
