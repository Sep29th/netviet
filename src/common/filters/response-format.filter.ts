import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { getReasonPhrase } from 'http-status-codes';

@Catch(HttpException)
export class ResponseFormatFilter<T extends HttpException>
  implements ExceptionFilter
{
  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();
    const status = exception.getStatus();
    const message = exception.getResponse();
    response.code(status).send({
      path: request.url,
      timestamp: new Date().toISOString(),
      statusCode: status,
      message:
        typeof message === 'string' || !('message' in message)
          ? message
          : message.message,
      error: getReasonPhrase(status),
    });
  }
}
