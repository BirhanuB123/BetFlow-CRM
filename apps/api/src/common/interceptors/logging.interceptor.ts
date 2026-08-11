import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { randomUUID } from 'crypto';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    const startTime = Date.now();
    const correlationId =
      (req.headers['x-correlation-id'] as string) ||
      `req-${randomUUID().substring(0, 8)}`;

    req.headers['x-correlation-id'] = correlationId;
    res.setHeader('X-Correlation-ID', correlationId);

    const { method, originalUrl } = req;

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const { statusCode } = res;
          this.logger.log(
            `[${method}] ${originalUrl} ${statusCode} - ${duration}ms [corr: ${correlationId}]`,
          );
        },
        error: (err: Error) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `[${method}] ${originalUrl} FAILED - ${duration}ms [corr: ${correlationId}] - ${err.message}`,
          );
        },
      }),
    );
  }
}
