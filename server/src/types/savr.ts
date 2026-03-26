export interface SavrPortfolio {
  fundName: string;
  currentFee: number;   // e.g. 1.25 (percent)
  savrFee: number;       // e.g. 0.98 (percent)
  balance: number;       // e.g. 500000 (SEK)
}

export interface SavrInsightResult {
  summary_text: string;
  savings_10y: number;
  savings_20y: number;
  risk_vibe: number;     // 1-10 scale
  details: {
    current_fee_cost_10y: number;
    savr_fee_cost_10y: number;
    current_fee_cost_20y: number;
    savr_fee_cost_20y: number;
    annual_return: number;
    balance: number;
  };
}
