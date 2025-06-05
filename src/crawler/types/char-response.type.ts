interface CurrentTradingPeriod {
  timezone: string;
  start: number;
  end: number;
  gmtoffset: number;
}

interface Meta {
  currency: string;
  symbol: string;
  exchangeName: string;
  fullExchangeName: string;
  instrumentType: string;
  firstTradeDate: number;
  regularMarketTime: number;
  hasPrePostMarketData: boolean;
  gmtoffset: number;
  timezone: string;
  exchangeTimezoneName: string;
  regularMarketPrice: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketVolume: number;
  longName: string;
  shortName: string;
  chartPreviousClose: number;
  priceHint: number;
  currentTradingPeriod: {
    pre: CurrentTradingPeriod;
    regular: CurrentTradingPeriod;
    post: CurrentTradingPeriod;
  };
  dataGranularity: string;
  range: string;
  validRanges: string[];
}

interface Quote {
  volume: number[];
  open: number[];
  high: number[];
  close: number[];
  low: number[];
}

interface AdjClose {
  adjclose: number[];
}

interface Indicators {
  quote: Quote[];
  adjclose: AdjClose[];
}

interface ChartResult {
  meta: Meta;
  timestamp: number[];
  indicators: Indicators;
}

interface Chart {
  result: ChartResult[];
  error: null | string;
}

export interface YahooFinanceChartResponse {
  chart: Chart;
}
