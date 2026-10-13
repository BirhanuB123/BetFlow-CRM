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

  // Flexible & Production-Ready CORS Config
  const rawOrigins = [
    process.env.ALLOWED_ORIGINS,
    process.env.FRONTEND_URL,
    process.env.APP_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.CORS_ORIGIN,
  ]
    .filter(Boolean)
    .flatMap((val) => val!.split(','))
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);

  const defaultOrigins = [
    'https://crm.bahirandelivery.cloud',
    'http://crm.bahirandelivery.cloud',
    'https://api.crm.bahirandelivery.cloud',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
  ];

  const allowedOrigins = Array.from(new Set([...defaultOrigins, ...rawOrigins]));
  const allowAll =
    process.env.ALLOWED_ORIGINS === '*' ||
    process.env.CORS_ALLOW_ALL === 'true';

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      const normalized = origin.trim().replace(/\/$/, '');

      const isAllowed =
        allowAll ||
        allowedOrigins.includes(normalized) ||
        /^https?:\/\/(?:[a-zA-Z0-9-]+\.)*bahirandelivery\.cloud(?::\d+)?$/.test(
          normalized,
        ) ||
        process.env.NODE_ENV === 'development';

      if (isAllowed) {
        return callback(null, true);
      }

      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Requested-With',
      'X-Tenant-Id',
      'Range',
    ],
    exposedHeaders: ['Content-Range', 'X-Total-Count'],
    maxAge: 86400,
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

  // Rewrite requests missing /api prefix (e.g. /auth/login -> /api/auth/login)
  app.use((req: any, res: any, next: () => void) => {
    if (
      req.url &&
      !req.url.startsWith('/api') &&
      !req.url.startsWith('/r/') &&
      !req.url.startsWith('/health')
    ) {
      req.url = `/api${req.url}`;
    }
    next();
  });

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

  await app.listen(process.env.PORT ?? 4000, '0.0.0.0');
}
void bootstrap();
