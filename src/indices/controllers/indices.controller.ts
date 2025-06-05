import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { IndicesService } from '../services/indices.service';
import { SupportedSymbolsGuard } from '../guards/supported-symbols.guard';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Throttle({
  short: { ttl: 1000, limit: 3 },
  medium: { ttl: 10000, limit: 20 },
  long: { ttl: 60000, limit: 100 },
})
@UseGuards(ThrottlerGuard)
@Controller({ path: 'indices', version: '1' })
export class IndicesController {
  constructor(private readonly indicesService: IndicesService) {}

  @Get()
  async getIndices() {
    return await this.indicesService.getIndices();
  }

  @Get(':name')
  @UseGuards(SupportedSymbolsGuard)
  async getIndicesByName(@Param('name') symbol: string) {
    const indices = await this.indicesService.getIndicesBySymbol(symbol);

    const analysis = this.indicesService.analyzeIndicesData(
      symbol,
      indices[0].currentPrice ?? 0,
    );

    return {
      indices,
      analysis,
    };
  }

  @Get('ping')
  ping() {
    return 'pong';
  }
}
