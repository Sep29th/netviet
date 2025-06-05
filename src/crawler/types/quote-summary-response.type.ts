import { QuoteResult } from './quote-result.type';

export interface QuoteSummaryResponse {
  quoteSummary: {
    symbols: string[];
    result: QuoteResult[];
    error: Error | null;
  };
}
