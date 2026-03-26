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
