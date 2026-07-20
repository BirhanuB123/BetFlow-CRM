import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from './auth.types';

type LoginBody = {
  email: string;
  password: string;
};

type RegisterBody = {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() body: RegisterBody) {
    return this.auth.register(body);
  }

  @Post('login')
  login(@Body() body: LoginBody) {
    return this.auth.login(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.auth.currentUser(user);
  }
}
