import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogsService } from './audit-logs.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, body, params } = request;

    // We only want to log mutations
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle().pipe(
        tap(() => {
          // Fire and forget logging
          try {
            let entityType = 'Unknown';
            let action = 'Unknown';

            // Basic heuristic to determine entity type and action based on URL/Method
            const parts = url.split('/').filter(Boolean);
            // e.g. /api/crm/leads => parts: ['api', 'crm', 'leads']
            if (parts.length > 0) {
              const lastPart = parts[parts.length - 1];
              const secondLastPart =
                parts.length > 1 ? parts[parts.length - 2] : '';

              if (lastPart.match(/^[0-9a-fA-F-]+$/) && secondLastPart) {
                // If it ends with UUID, the entity is the second last part
                entityType = secondLastPart;
              } else {
                entityType = lastPart;
              }

              // Clean query strings if any
              entityType = entityType.split('?')[0];
            }

            if (method === 'POST') action = 'Created';
            else if (method === 'PUT' || method === 'PATCH') action = 'Updated';
            else if (method === 'DELETE') action = 'Deleted';

            const entityId = params?.id || body?.id || 'N/A';

            this.auditLogsService.create({
              userId: user?.userId || null, // from JwtAuthGuard
              action: `${action} ${entityType}`,
              entityType: entityType,
              entityId: entityId,
              newValues: body ? (body as any) : undefined,
            });
          } catch (e) {
            console.error('Failed to log audit event', e);
          }
        }),
      );
    }

    return next.handle();
  }
}
