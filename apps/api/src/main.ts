import { config } from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

config({ path: ['.env.local', '.env', '../../.env'] });

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // Graceful shutdown process lifecycle
  app.enableShutdownHooks();

  // Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disabled for OpenAPI Swagger UI compatibility
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Strict CORS Config
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : [
        process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'http://localhost:3001',
      ];

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        process.env.NODE_ENV === 'development'
      ) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  });

  // Global DTO Validation Pipe & Payload Sanitization
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global Exception Filters & Request Logging Interceptor
  app.useGlobalFilters(new PrismaExceptionFilter(), new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  app.setGlobalPrefix('api', {
    exclude: ['r/(.*)'],
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('BetFlow Real Estate CRM API')
    .setDescription(
      'Enterprise Real Estate CRM REST API Documentation. Covers CRM leads, customer management, inventory tracking, reservation workflows, PDF generation, digital signatures, payment schedules, and SMS integrations.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 4000);
}
void bootstrap();
