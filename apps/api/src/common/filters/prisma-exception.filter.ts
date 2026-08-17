import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'A database error occurred';
    let error = 'Internal Server Error';

    switch (exception.code) {
      case 'P2002': {
        status = HttpStatus.CONFLICT;
        const target =
          (exception.meta?.target as string[])?.join(', ') || 'field';
        message = `A record with this ${target} already exists.`;
        error = 'Conflict';
        break;
      }
      case 'P2025': {
        status = HttpStatus.NOT_FOUND;
        message = 'The requested record was not found in the database.';
        error = 'Not Found';
        break;
      }
      case 'P2003': {
        status = HttpStatus.BAD_REQUEST;
        const fieldName =
          (exception.meta?.field_name as string) || 'related entity';
        message = `Invalid reference for ${fieldName}. Referenced record does not exist.`;
        error = 'Bad Request';
        break;
      }
      default: {
        this.logger.error(
          `Unhandled Prisma Error [${exception.code}]: ${exception.message}`,
          exception.stack,
        );
        message = `Database operation failed [code: ${exception.code}]`;
        break;
      }
    }

    const correlationId =
      (request.headers['x-correlation-id'] as string) || undefined;

    this.logger.warn(
      `Prisma Error [${exception.code}] on [${request.method}] ${request.url}: ${message}`,
    );

    response.status(status).json({
      statusCode: status,
      error,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(correlationId ? { correlationId } : {}),
    });
  }
}
