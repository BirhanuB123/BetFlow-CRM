import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { InMemoryService, Task } from '../database/in-memory.service';

type CreateTaskBody = Omit<Task, 'id'>;

@Controller('tasks')
export class TasksController {
  constructor(private readonly store: InMemoryService) {}

  @Get()
  list(@Query('tenantId') tenantId?: string) {
    return this.store.listTasks(tenantId);
  }

  @Post()
  create(@Body() body: CreateTaskBody) {
    return this.store.createTask(body);
  }
}
