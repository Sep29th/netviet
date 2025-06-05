import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CrawlerService } from './crawler.service';
import { IndicesService } from 'src/indices/services/indices.service';
import { IndicesGateway } from 'src/indices/gateways/indices.gateway';
import { Logger } from 'src/common/services/logger.service';
import { AnalizedData } from '../types/analized-data.type';

@Injectable()
export class ScheduleCrawService {
  constructor(
    @Inject('ANALYTICS_DATA')
    private analysisData: AnalizedData,
    private readonly crawlerService: CrawlerService,
    private readonly indicesService: IndicesService,
    private readonly indicesGateway: IndicesGateway,
    private readonly logger: Logger,
  ) {}

  @Cron('0 */4 * * * *')
  async handleCron() {
    try {
      const data = await this.crawlerService.fetchRawQuoteData();

      if (!data || data.length <= 0) return;

      await this.indicesService.updateNewData(data);

      this.analysisData = await Promise.all(
        data.map(async (item) => ({
          symbol: item.price.symbol,
          name: item.price.longName,
          currentPrice: item.price.regularMarketPrice.raw ?? 0,
          ...(await this.indicesService.analyzeIndicesData(
            item.price.symbol,
            item.price.regularMarketPrice.raw ?? 0,
          )),
        })),
      );

      this.analysisData.forEach((item) => {
        this.indicesGateway.broadcastToIndices(item.symbol, {
          indices: {
            name: item.name,
            currentPrice: item.currentPrice,
          },
          analysis: {
            comparisonPercentage: item.comparisonPercentage,
            recommendation: item.recommendation,
          },
        });
      });
    } catch (error: unknown) {
      if (typeof error === 'string') {
        this.logger.error(`Error in ScheduleCrawService: ${error}`);
      } else if (error instanceof Error) {
        this.logger.error(`Error in ScheduleCrawService: ${error.message}`);
      } else {
        this.logger.error('Unknown error in ScheduleCrawService');
      }
      return;
    }
  }
}
