import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import config from '../../config';
import { NotSupportedSymbolException } from '../exceptions/not-supported-symbol.exception';

@Injectable()
export class SupportedSymbolsGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<FastifyRequest>();

    const params = request.params as Record<string, string>;

    const symbol = params.name;

    if (!config.symbols.includes(symbol)) {
      throw new NotSupportedSymbolException(symbol);
    }

    return true;
  }
}
