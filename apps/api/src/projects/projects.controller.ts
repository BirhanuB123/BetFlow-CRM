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
import { ProjectsService } from './projects.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import type { CreateProjectInput, UpdateProjectInput } from './projects.types';

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.projects.list(user.tenantId);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.projects.get(user.tenantId, id);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateProjectInput,
  ) {
    return this.projects.create(user.tenantId, user.id, body);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: UpdateProjectInput,
  ) {
    return this.projects.update(user.tenantId, user.id, id, body);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.projects.remove(user.tenantId, user.id, id);
  }
}
