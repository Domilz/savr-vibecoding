export interface Holding {
  ticker: string;
  shares: number;
  avgCostBasis: number;
  name?: string;
  currency: "USD" | "SEK";
}

export interface Portfolio {
  holdings: Holding[];
  lastUpdated: string;
}

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

export interface CacheStatus {
  entries: number;
  dailyRequestsUsed: number;
  dailyRequestsRemaining: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface WatchlistItem {
  ticker: string;
  name: string;
  currency: "USD" | "SEK";
}

export interface Watchlist {
  id: string;
  name: string;
  items: WatchlistItem[];
  createdAt: string;
  createdBy: "user" | "ai";
}

export interface ChatAction {
  type: string;
  watchlist?: Watchlist;
}

export interface FundData {
  id: string;
  name: string;
  category: string;
  savrFee: number;
  avanzaFee: number;
  nordnetFee: number;
}

export interface SavrPortfolio {
  fundName: string;
  currentFee: number;
  savrFee: number;
  balance: number;
}

export interface SavrInsightResult {
  summary_text: string;
  savings_10y: number;
  savings_20y: number;
  risk_vibe: number;
  details: {
    current_fee_cost_10y: number;
    savr_fee_cost_10y: number;
    current_fee_cost_20y: number;
    savr_fee_cost_20y: number;
    annual_return: number;
    balance: number;
  };
}
