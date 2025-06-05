import { RecommendationMessage } from 'src/indices/types/recommendation';

export type AnalizedData = {
  comparisonPercentage: null | number;
  recommendation: RecommendationMessage;
  symbol: string;
  name: string;
  currentPrice: number;
}[];
