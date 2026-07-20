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
  companyName: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  password?: string;
  region?: string;
  plan?: string;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}



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
