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
import { TasksService } from './tasks.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission, Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { AuthenticatedUser } from '../../core/auth/auth.types';
import type {
  CreateTaskInput,
  UpdateTaskInput,
  UpdateTaskStatusInput,
} from './tasks.types';

@UseGuards(JwtAuthGuard, RolesGuard)
@RequirePermission('tasks.manage')
@Roles('Owner', 'Admin', 'Sales Manager', 'Agent', 'Finance', 'Marketing')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('status') status?: string,
    @Query('assigneeId') assigneeId?: string,
    @Query('open') open?: string,
  ) {
    return this.tasks.list({
      status,
      assigneeId,
      open: open === 'true' || open === '1',
    });
  }

  @Get(':id')
  get(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.tasks.get(id);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateTaskInput,
  ) {
    return this.tasks.create(user.id, body);
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: UpdateTaskStatusInput,
  ) {
    return this.tasks.updateStatus(user.id, id, body.status);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: UpdateTaskInput,
  ) {
    return this.tasks.update(user.id, id, body);
  }

  @Delete(':id')
  @Roles('Owner', 'Admin', 'Sales Manager')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.tasks.remove(user.id, id);
  }
}
