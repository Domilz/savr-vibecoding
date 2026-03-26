import { getPortfolio } from "./portfolioStore";
import * as av from "./alphaVantage";
import * as claude from "./claude";
import { BriefingResult, SourceReference } from "../types/briefing";
import { TopGainersLosers } from "../types/market";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateBriefing(): Promise<BriefingResult> {
  const portfolio = getPortfolio();
  const allSources: SourceReference[] = [];
  const marketData = new Map<string, claude.MarketDataBundle>();

  // Fetch market data sequentially — AV free tier allows 1 req/sec
  for (const holding of portfolio.holdings) {
    const quoteResult = await av.getQuote(holding.ticker);
    await delay(1200);
    const overviewResult = await av.getOverview(holding.ticker);
    await delay(1200);
    const newsResult = await av.getNewsSentiment(holding.ticker);
    await delay(1200);

    marketData.set(holding.ticker, {
      quote: quoteResult.data,
      overview: overviewResult.data,
      news: newsResult.data,
    });

    allSources.push(...quoteResult.sources, ...overviewResult.sources, ...newsResult.sources);
  }

  // Fetch top gainers/losers
  let topGainersLosers: TopGainersLosers | null = null;
  try {
    const tglResult = await av.getTopGainersLosers();
    topGainersLosers = tglResult.data;
    allSources.push(...tglResult.sources);
  } catch (err) {
    console.warn("Failed to fetch top gainers/losers:", err);
  }

  // Build prompt and call Claude
  const userMessage = claude.buildPrompt(portfolio, marketData, topGainersLosers);
  const analysis = await claude.analyze(userMessage);

  if (analysis.parseError) {
    return {
      generatedAt: new Date().toISOString(),
      marketSummary: analysis.raw || "Failed to parse analysis",
      holdings: [],
      overallRiskFactors: [],
      disclaimer: "Analysis could not be structured. Showing raw output.",
      sources: allSources,
    };
  }

  // Map Claude's response to our BriefingResult
  const holdingAnalyses = (analysis.holdings || []).map((h: any) => {
    const quote = marketData.get(h.ticker)?.quote;
    const holdingSources: SourceReference[] = allSources.filter(
      (s) => s.title.includes(h.ticker) || s.type === "news"
    );
    return {
      ticker: h.ticker,
      name: h.name,
      sentiment: h.sentiment,
      sentimentReason: h.sentimentReason,
      currentPrice: quote?.price ?? 0,
      priceTargetLow: h.priceTargetLow,
      priceTargetMid: h.priceTargetMid,
      priceTargetHigh: h.priceTargetHigh,
      keyRisks: h.keyRisks || [],
      sources: holdingSources,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    marketSummary: analysis.marketSummary,
    holdings: holdingAnalyses,
    overallRiskFactors: analysis.overallRiskFactors || [],
    disclaimer: analysis.disclaimer || "This is AI-generated analysis for informational purposes only, not financial advice.",
    sources: allSources,
  };
}
