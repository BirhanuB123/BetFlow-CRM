import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/core/auth/auth.service';

describe('AuthController Rate Limiting & DTO Validation (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AuthService)
      .useValue({
        login: jest.fn().mockImplementation(async (dto: any) => {
          if (dto.email === 'admin@betflow.et' && dto.password === 'validPassword123') {
            return { accessToken: 'mock-jwt-token', user: { id: 'usr-1', email: dto.email } };
          }
          return { error: 'Invalid credentials' };
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  it('should reject requests with invalid payload structures (400 Bad Request)', async () => {
    // Missing email and password
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({})
      .expect(400);

    // Invalid email format
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'not-an-email', password: '123' })
      .expect(400);
  });

  it('should reject non-whitelisted payload parameters (400 Bad Request)', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@betflow.et',
        password: 'validPassword123',
        maliciousExtraField: true,
      })
      .expect(400);
  });

  afterEach(async () => {
    await app.close();
  });
});
