import { BadRequestException } from '@nestjs/common';

export class NotSupportedSymbolException extends BadRequestException {
  constructor(symbol: string) {
    super(`Symbol ${symbol || ''} is not supported.`);
  }
}
