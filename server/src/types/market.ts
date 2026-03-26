export interface GlobalQuote {
  symbol: string;
  open: number;
  high: number;
  low: number;
  price: number;
  volume: number;
  latestTradingDay: string;
  previousClose: number;
  change: number;
  changePercent: string;
}

export interface CompanyOverview {
  symbol: string;
  name: string;
  description: string;
  sector: string;
  industry: string;
  marketCap: number;
  peRatio: number;
  forwardPE: number;
  eps: number;
  dividendYield: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  analystTargetPrice: number;
  analystRatings: {
    strongBuy: number;
    buy: number;
    hold: number;
    sell: number;
    strongSell: number;
  };
  beta: number;
}

export interface NewsArticle {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  summary: string;
  overallSentiment: string;
  overallSentimentScore: number;
  tickerSentiments: {
    ticker: string;
    relevance: number;
    sentiment: string;
    sentimentScore: number;
  }[];
}

export interface TopGainersLosers {
  metadata: string;
  topGainers: { ticker: string; price: string; changeAmount: string; changePercentage: string; volume: string }[];
  topLosers: { ticker: string; price: string; changeAmount: string; changePercentage: string; volume: string }[];
  mostActive: { ticker: string; price: string; changeAmount: string; changePercentage: string; volume: string }[];
}
