import { Inject, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { QuoteResult } from 'src/crawler/types/quote-result.type';
import { Indices } from 'src/mongo/schemas/indices.schema';
import { RecommendationMessage } from '../types/recommendation';
import { Logger } from 'src/common/services/logger.service';
import { AxiosCircuitBreakerService } from 'src/crawler/services/axios-circuit-breaker.service';
import { AnalizedData } from 'src/crawler/types/analized-data.type';

@Injectable()
export class IndicesService {
  constructor(
    @Inject('ANALYTICS_DATA')
    private readonly analysisData: AnalizedData,
    @InjectModel(Indices.name)
    private readonly indicesModel: Model<Indices>,
    @InjectConnection()
    private readonly connection: Connection,
    private readonly logger: Logger,
    private readonly axiosCircuitBreakerService: AxiosCircuitBreakerService,
  ) {}

  async updateNewData(data: QuoteResult[]) {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const docs = data.map((item) => ({
        symbol: item.price.symbol,
        name: item.price.longName,
        currency: item.price.currency,
        currentPrice: item.price.regularMarketPrice.raw,
        openPrice: item.price.regularMarketOpen.raw,
        hightPrice: item.summaryDetail.fiftyTwoWeekHigh.raw,
        lowPrice: item.summaryDetail.fiftyTwoWeekLow.raw,
        changePercent: item.price.regularMarketChangePercent.raw,
        timestamp: new Date(item.price.regularMarketTime * 1000),
      }));

      await this.indicesModel.insertMany(docs, {
        session,
        ordered: false,
      });

      await session.commitTransaction();
    } catch (error: unknown) {
      if (typeof error === 'string') {
        this.logger.error('Error during transaction: ' + error);
      } else if (error instanceof Error) {
        this.logger.error('Error during transaction: ' + error.message);
      } else {
        this.logger.error('Unknown error during transaction');
      }
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async analyzeIndicesData(symbol: string, currentPrice: number) {
    const averagePreviousClose =
      await this.getAverageOfLastPreviousClosePrices(symbol);

    if (averagePreviousClose === undefined) {
      return {
        comparisonPercentage: null,
        recommendation: RecommendationMessage.NOT,
      };
    }

    const comparisonPercentage = (currentPrice / averagePreviousClose) * 100;

    let recommendation = RecommendationMessage.NOT;

    if (comparisonPercentage > 105) {
      recommendation = RecommendationMessage.BUY;
    } else if (comparisonPercentage < 95) {
      recommendation = RecommendationMessage.SELL;
    }

    return {
      comparisonPercentage: parseFloat(comparisonPercentage.toFixed(2)),
      recommendation,
    };
  }

  async getIndices() {
    const indices = await this.indicesModel
      .find()
      .sort({ timestamp: -1 })
      .exec();

    return indices;
  }

  async getIndicesBySymbol(symbol: string) {
    const indices = await this.indicesModel
      .find({ symbol })
      .sort({ timestamp: -1 })
      .exec();

    return indices;
  }

  getAnalyticsData(symbol: string) {
    const analized = this.analysisData.find((item) => item.symbol === symbol);

    return {
      comparisonPercentage: analized?.comparisonPercentage ?? null,
      recommendation: analized?.recommendation ?? RecommendationMessage.NOT,
    };
  }

  getAnalyticsDataWithIndice(symbol: string) {
    const analized = this.analysisData.find((item) => item.symbol === symbol);

    if (!analized)
      return {
        comparisonPercentage: null,
        recommendation: RecommendationMessage.NOT,
        symbol,
        name: '',
        currentPrice: -1,
      };

    return analized;
  }

  private async getAverageOfLastPreviousClosePrices(symbol: string) {
    const res = await this.axiosCircuitBreakerService.getHistoryPrice(symbol);

    if (res === false || !res.data.chart || !res.data.chart.result) {
      this.logger.error(`Failed to fetch history price for symbol: ${symbol}`);
      return undefined;
    }

    const closePrice = res.data.chart.result[0].indicators.quote[0].close;

    if (!closePrice || closePrice.length === 0) {
      this.logger.error(`No close prices found for symbol: ${symbol}`);
      return undefined;
    }

    const sum = closePrice.reduce((acc, price) => acc + price, 0);
    const average = sum / closePrice.length;

    return parseFloat(average.toFixed(2));
  }
}
