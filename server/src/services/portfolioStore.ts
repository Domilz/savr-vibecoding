import { Portfolio, Holding } from "../types/portfolio";

let portfolio: Portfolio = {
  holdings: [
    { ticker: "AAPL", shares: 50, avgCostBasis: 178.5, name: "Apple Inc.", currency: "USD" },
    { ticker: "MSFT", shares: 30, avgCostBasis: 345.0, name: "Microsoft Corp.", currency: "USD" },
    { ticker: "NVDA", shares: 20, avgCostBasis: 480.0, name: "NVIDIA Corp.", currency: "USD" },
    { ticker: "VOLV-B.STO", shares: 200, avgCostBasis: 245.0, name: "Volvo B", currency: "SEK" },
    { ticker: "ERIC-B.STO", shares: 500, avgCostBasis: 72.5, name: "Ericsson B", currency: "SEK" },
    { ticker: "HM-B.STO", shares: 150, avgCostBasis: 158.0, name: "H&M B", currency: "SEK" },
    { ticker: "ATCO-A.STO", shares: 100, avgCostBasis: 182.0, name: "Atlas Copco A", currency: "SEK" },
  ],
  lastUpdated: new Date().toISOString(),
};

export function getPortfolio(): Portfolio {
  return portfolio;
}

export function updatePortfolio(holdings: Holding[]): Portfolio {
  portfolio = {
    holdings,
    lastUpdated: new Date().toISOString(),
  };
  return portfolio;
}
