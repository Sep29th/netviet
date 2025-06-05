import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import config from '../../config';
import { NotSupportedSymbolException } from '../exceptions/not-supported-symbol.exception';
import { Socket } from 'socket.io';

@Injectable()
export class SupportedSymbolsGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    switch (context.getType()) {
      case 'http': {
        return this.validateHttp(context);
      }
      case 'ws': {
        return this.validateWs(context);
      }
    }
    return false;
  }

  private validateHttp(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FastifyRequest>();

    const params = request.params as Record<string, string>;

    const symbol = params.name;

    if (!config.symbols.includes(symbol)) {
      throw new NotSupportedSymbolException(symbol);
    }

    return true;
  }

  private validateWs(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<Socket>();
    const data = context.switchToWs().getData<unknown>();

    if (typeof data !== 'string') {
      const errorMessage = 'Invalid data type. Expected string.';
      client.emit('error', {
        event: 'subscribeToIndices',
        message: errorMessage,
        code: 'INVALID_DATA_TYPE',
      });
      return false;
    }

    if (!config.symbols.includes(data)) {
      const errorMessage = `Index '${data}' is not supported. Valid indices: ${config.symbols.join(', ')}`;

      client.emit('error', {
        event: 'subscribeToIndices',
        message: errorMessage,
        code: 'INVALID_INDEX',
        validIndices: config.symbols,
      });

      return false;
    }
    return true;
  }
}
