import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { getReasonPhrase } from 'http-status-codes';
import { map, Observable } from 'rxjs';

@Injectable()
export class ResponseFormatInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const response = httpContext.getResponse<FastifyReply>();
    const request = httpContext.getRequest<FastifyRequest>();
    return next.handle().pipe(
      map((data: unknown) => ({
        path: request.url,
        timestamp: new Date().toISOString(),
        statusCode: response.statusCode,
        message: getReasonPhrase(response.statusCode),
        success: data,
      })),
    );
  }
}
