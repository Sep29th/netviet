import { Inject, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import config from '../../config';
import { QuoteResult } from 'src/crawler/types/quote-result.type';
import { Indices } from 'src/mongo/schemas/indices.schema';
import { RecommendationMessage } from '../types/recommendation';
import { Logger } from 'src/common/services/logger.service';

@Injectable()
export class IndicesService {
  constructor(
    @Inject('LAST_PREVIOUS_CLOSE_PRICES')
    private readonly lastPreviousClosePrices: {
      value: { [key: string]: number }[];
      index: number;
    },
    @InjectModel(Indices.name)
    private readonly indicesModel: Model<Indices>,
    @InjectConnection()
    private readonly connection: Connection,
    private readonly logger: Logger,
  ) {}

  async updateNewData(data: QuoteResult[]) {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      await this.indicesModel.insertMany(
        data.map((item) => ({
          symbol: item.price.symbol,
          name: item.price.longName,
          currency: item.price.currency,
          currentPrice: item.price.regularMarketPrice.raw,
          openPrice: item.price.regularMarketOpen.raw,
          hightPrice: item.summaryDetail.fiftyTwoWeekHigh.raw,
          lowPrice: item.summaryDetail.fiftyTwoWeekLow.raw,
          changePercent: item.price.regularMarketChangePercent.raw,
          timestamp: new Date(item.price.regularMarketTime * 1000),
        })),
        { session },
      );
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

    const newData: { [key: string]: number } = {};
    data.forEach((item) => {
      const symbol = item.price.symbol;
      const previousClose = item.summaryDetail.previousClose.raw;
      if (symbol && previousClose) {
        newData[symbol] = previousClose;
      }
    });
    this.addNewDataToLastPreviousClosePrices(newData);
  }

  analyzeIndicesData(symbol: string, currentPrice: number) {
    const averagePreviousClose =
      this.getAverageOfLastPreviousClosePrices(symbol);

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

  private addNewDataToLastPreviousClosePrices(data: { [key: string]: number }) {
    this.lastPreviousClosePrices.value[this.lastPreviousClosePrices.index] =
      data;
    this.lastPreviousClosePrices.index =
      (this.lastPreviousClosePrices.index + 1) %
      config.numberOfRecordsToAverage;
  }

  private getAverageOfLastPreviousClosePrices(symbol: string) {
    const prices = this.lastPreviousClosePrices.value.map(
      (item) => item[symbol],
    );
    const validPrices = prices.filter((price) => price !== undefined);
    if (validPrices.length === 0) return undefined;
    const sum = validPrices.reduce((acc, price) => acc + price, 0);
    return sum / validPrices.length;
  }
}
