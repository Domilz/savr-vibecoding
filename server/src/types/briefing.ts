export interface SourceReference {
  title: string;
  url: string;
  source: string;
  type: "news" | "data" | "fundamental";
}

export interface HoldingAnalysis {
  ticker: string;
  name: string;
  sentiment: "bullish" | "bearish" | "neutral";
  sentimentReason: string;
  currentPrice: number;
  priceTargetLow: number;
  priceTargetMid: number;
  priceTargetHigh: number;
  keyRisks: string[];
  sources: SourceReference[];
}

export interface BriefingResult {
  generatedAt: string;
  marketSummary: string;
  holdings: HoldingAnalysis[];
  overallRiskFactors: string[];
  disclaimer: string;
  sources: SourceReference[];
}
