import { DefaultKeyStatistics } from './default-key-statistics.type';
import { Price } from './price.type';
import { SummaryDetail } from './summary-detail.type';

export interface QuoteResult {
  summaryDetail: SummaryDetail;
  price: Price;
  defaultKeyStatistics: DefaultKeyStatistics;
}
