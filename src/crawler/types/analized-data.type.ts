import { RecommendationMessage } from 'src/indices/types/recommendation';

export type AnalizedData = {
  comparisonPercentage: string | number;
  recommendation: RecommendationMessage;
  symbol: string;
  name: string;
  currentPrice: number;
}[];
