import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { IndicesService } from '../services/indices.service';
import { SupportedSymbolsGuard } from '../guards/supported-symbols.guard';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { PaginationQueryDTO } from '../dtos/pagination-query.dto';

@Throttle({
  short: { ttl: 1000, limit: 3 },
  medium: { ttl: 10000, limit: 20 },
  long: { ttl: 60000, limit: 100 },
})
@UseGuards(ThrottlerGuard)
@Controller({ path: 'api/indices', version: '1' })
export class IndicesController {
  constructor(private readonly indicesService: IndicesService) {}

  @Get()
  async getIndices(@Query() paginationQueryDto: PaginationQueryDTO) {
    return await this.indicesService.getIndices(
      paginationQueryDto.page,
      paginationQueryDto.limit,
    );
  }

  @Get(':name')
  @UseGuards(SupportedSymbolsGuard)
  async getIndicesByName(
    @Param('name') symbol: string,
    @Query() paginationQueryDto: PaginationQueryDTO,
  ) {
    const indices = await this.indicesService.getIndicesBySymbol(
      symbol,
      paginationQueryDto.page,
      paginationQueryDto.limit,
    );

    const analysis = this.indicesService.getAnalyticsData(symbol);

    return {
      analysis,
      indices,
    };
  }
}
