import { Body, Controller, Post } from '@nestjs/common';
import { InMemoryService } from '../database/in-memory.service';

type LoginBody = {
  email: string;
  password: string;
  tenantSlug: string;
};

type RegisterBody = {
  companyName: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  region?: string;
  plan?: string;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly store: InMemoryService) {}

  @Post('register')
  register(@Body() body: RegisterBody) {
    return this.store.registerTenant(body);
  }

  @Post('login')
  login(@Body() body: LoginBody) {
    const tenant = this.store
      .listTenants()
      .find((item) => item.slug === body.tenantSlug);
    const user = this.store
      .listUsers(tenant?.id)
      .find((item) => item.email === body.email);

    return {
      accessToken: 'phase-one-dev-token',
      tenant,
      user,
      expiresIn: 3600,
      authMethod: body.password ? 'password' : 'unknown',
    };
  }
}
