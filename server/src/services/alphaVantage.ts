import { config } from "../config";
import { GlobalQuote, CompanyOverview, NewsArticle, TopGainersLosers } from "../types/market";
import { SourceReference } from "../types/briefing";

interface CacheEntry<T> {
  data: T;
  fetchedAt: number;
  sources: SourceReference[];
}

const cache = new Map<string, CacheEntry<any>>();
let dailyRequestCount = 0;
let dailyResetAt = getNextMidnight();

function getNextMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime();
}

function checkDailyReset() {
  if (Date.now() > dailyResetAt) {
    dailyRequestCount = 0;
    dailyResetAt = getNextMidnight();
  }
}

const TTL = {
  GLOBAL_QUOTE: 4 * 60 * 60 * 1000,
  OVERVIEW: 24 * 60 * 60 * 1000,
  NEWS_SENTIMENT: 2 * 60 * 60 * 1000,
  TOP_GAINERS_LOSERS: 4 * 60 * 60 * 1000,
};

async function fetchAV(params: Record<string, string>): Promise<any> {
  checkDailyReset();
  dailyRequestCount++;

  const url = new URL("https://www.alphavantage.co/query");
  url.searchParams.set("apikey", config.ALPHAVANTAGE_API_KEY);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString());
  const data = (await response.json()) as Record<string, any>;

  if (data["Note"] || data["Information"]) {
    throw new Error(`Alpha Vantage rate limit: ${data["Note"] || data["Information"]}`);
  }

  if (data["Error Message"]) {
    throw new Error(`Alpha Vantage error: ${data["Error Message"]}`);
  }

  return data;
}

async function cachedFetch<T>(
  cacheKey: string,
  ttlMs: number,
  fetcher: () => Promise<{ data: T; sources: SourceReference[] }>
): Promise<{ data: T; sources: SourceReference[] }> {
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < ttlMs) {
    return { data: cached.data, sources: cached.sources };
  }

  const result = await fetcher();
  cache.set(cacheKey, { data: result.data, fetchedAt: Date.now(), sources: result.sources });
  return result;
}

function parseNum(val: string | undefined): number {
  if (!val || val === "None" || val === "-") return 0;
  return parseFloat(val) || 0;
}

export async function getQuote(ticker: string): Promise<{ data: GlobalQuote; sources: SourceReference[] }> {
  if (isSwedishStock(ticker)) return getSwedishQuote(ticker);
  return cachedFetch(`GLOBAL_QUOTE:${ticker}`, TTL.GLOBAL_QUOTE, async () => {
    const raw = await fetchAV({ function: "GLOBAL_QUOTE", symbol: ticker });
    const q = raw["Global Quote"] || {};
    const data: GlobalQuote = {
      symbol: q["01. symbol"] || ticker,
      open: parseNum(q["02. open"]),
      high: parseNum(q["03. high"]),
      low: parseNum(q["04. low"]),
      price: parseNum(q["05. price"]),
      volume: parseNum(q["06. volume"]),
      latestTradingDay: q["07. latest trading day"] || "",
      previousClose: parseNum(q["08. previous close"]),
      change: parseNum(q["09. change"]),
      changePercent: q["10. change percent"] || "0%",
    };
    const sources: SourceReference[] = [{
      title: `${ticker} Quote Data`,
      url: `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}`,
      source: "Alpha Vantage",
      type: "data",
    }];
    return { data, sources };
  });
}

export async function getOverview(ticker: string): Promise<{ data: CompanyOverview; sources: SourceReference[] }> {
  if (isSwedishStock(ticker)) return getSwedishOverview(ticker);
  return cachedFetch(`OVERVIEW:${ticker}`, TTL.OVERVIEW, async () => {
    const raw = await fetchAV({ function: "OVERVIEW", symbol: ticker });
    const data: CompanyOverview = {
      symbol: raw["Symbol"] || ticker,
      name: raw["Name"] || ticker,
      description: raw["Description"] || "",
      sector: raw["Sector"] || "",
      industry: raw["Industry"] || "",
      marketCap: parseNum(raw["MarketCapitalization"]),
      peRatio: parseNum(raw["PERatio"]),
      forwardPE: parseNum(raw["ForwardPE"]),
      eps: parseNum(raw["EPS"]),
      dividendYield: parseNum(raw["DividendYield"]),
      fiftyTwoWeekHigh: parseNum(raw["52WeekHigh"]),
      fiftyTwoWeekLow: parseNum(raw["52WeekLow"]),
      analystTargetPrice: parseNum(raw["AnalystTargetPrice"]),
      analystRatings: {
        strongBuy: parseNum(raw["AnalystRatingStrongBuy"]),
        buy: parseNum(raw["AnalystRatingBuy"]),
        hold: parseNum(raw["AnalystRatingHold"]),
        sell: parseNum(raw["AnalystRatingSell"]),
        strongSell: parseNum(raw["AnalystRatingStrongSell"]),
      },
      beta: parseNum(raw["Beta"]),
    };
    const sources: SourceReference[] = [{
      title: `${ticker} Company Fundamentals`,
      url: `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}`,
      source: "Alpha Vantage",
      type: "fundamental",
    }];
    return { data, sources };
  });
}

export async function getNewsSentiment(ticker: string): Promise<{ data: NewsArticle[]; sources: SourceReference[] }> {
  if (isSwedishStock(ticker)) {
    // AV doesn't support .STO news — return empty
    return { data: [], sources: [] };
  }
  return cachedFetch(`NEWS_SENTIMENT:${ticker}`, TTL.NEWS_SENTIMENT, async () => {
    const raw = await fetchAV({ function: "NEWS_SENTIMENT", tickers: ticker, limit: "5" });
    const feed = raw["feed"] || [];
    const articles: NewsArticle[] = feed.slice(0, 5).map((item: any) => ({
      title: item["title"] || "",
      url: item["url"] || "",
      source: item["source"] || "",
      publishedAt: item["time_published"] || "",
      summary: item["summary"] || "",
      overallSentiment: item["overall_sentiment_label"] || "Neutral",
      overallSentimentScore: parseFloat(item["overall_sentiment_score"] || "0"),
      tickerSentiments: (item["ticker_sentiment"] || []).map((ts: any) => ({
        ticker: ts["ticker"] || "",
        relevance: parseFloat(ts["relevance_score"] || "0"),
        sentiment: ts["ticker_sentiment_label"] || "Neutral",
        sentimentScore: parseFloat(ts["ticker_sentiment_score"] || "0"),
      })),
    }));
    const sources: SourceReference[] = articles.map((a) => ({
      title: a.title,
      url: a.url,
      source: a.source,
      type: "news" as const,
    }));
    return { data: articles, sources };
  });
}

export async function getTopGainersLosers(): Promise<{ data: TopGainersLosers; sources: SourceReference[] }> {
  return cachedFetch("TOP_GAINERS_LOSERS", TTL.TOP_GAINERS_LOSERS, async () => {
    const raw = await fetchAV({ function: "TOP_GAINERS_LOSERS" });
    const data: TopGainersLosers = {
      metadata: raw["metadata"] || "",
      topGainers: (raw["top_gainers"] || []).slice(0, 5),
      topLosers: (raw["top_losers"] || []).slice(0, 5),
      mostActive: (raw["most_actively_traded"] || []).slice(0, 5),
    };
    const sources: SourceReference[] = [{
      title: "Market Top Gainers, Losers & Most Active",
      url: "https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS",
      source: "Alpha Vantage",
      type: "data",
    }];
    return { data, sources };
  });
}

// Swedish stocks — AV free tier doesn't support .STO tickers, so we use mock data
const SWEDISH_STOCK_DATA: Record<string, { quote: GlobalQuote; overview: CompanyOverview }> = {
  "VOLV-B.STO": {
    quote: { symbol: "VOLV-B.STO", open: 260.4, high: 264.8, low: 258.2, price: 262.5, volume: 4832000, latestTradingDay: new Date().toISOString().split("T")[0], previousClose: 259.8, change: 2.7, changePercent: "+1.04%" },
    overview: { symbol: "VOLV-B.STO", name: "Volvo B", description: "Volvo Group - global manufacturer of trucks, buses, construction equipment", sector: "Industrials", industry: "Truck Manufacturing", marketCap: 520000000000, peRatio: 11.2, forwardPE: 10.5, eps: 23.4, dividendYield: 0.036, fiftyTwoWeekHigh: 290, fiftyTwoWeekLow: 210, analystTargetPrice: 285, analystRatings: { strongBuy: 8, buy: 12, hold: 5, sell: 1, strongSell: 0 }, beta: 1.15 },
  },
  "ERIC-B.STO": {
    quote: { symbol: "ERIC-B.STO", open: 78.2, high: 79.6, low: 77.5, price: 79.1, volume: 12500000, latestTradingDay: new Date().toISOString().split("T")[0], previousClose: 77.8, change: 1.3, changePercent: "+1.67%" },
    overview: { symbol: "ERIC-B.STO", name: "Ericsson B", description: "Telefonaktiebolaget LM Ericsson - global telecommunications equipment", sector: "Technology", industry: "Telecommunications Equipment", marketCap: 265000000000, peRatio: 18.5, forwardPE: 15.2, eps: 4.27, dividendYield: 0.032, fiftyTwoWeekHigh: 92, fiftyTwoWeekLow: 58, analystTargetPrice: 88, analystRatings: { strongBuy: 5, buy: 10, hold: 8, sell: 3, strongSell: 1 }, beta: 1.05 },
  },
  "HM-B.STO": {
    quote: { symbol: "HM-B.STO", open: 162.3, high: 165.1, low: 160.8, price: 163.5, volume: 6200000, latestTradingDay: new Date().toISOString().split("T")[0], previousClose: 161.0, change: 2.5, changePercent: "+1.55%" },
    overview: { symbol: "HM-B.STO", name: "H&M B", description: "Hennes & Mauritz - global fashion retailer", sector: "Consumer Cyclical", industry: "Apparel Retail", marketCap: 280000000000, peRatio: 22.1, forwardPE: 19.8, eps: 7.4, dividendYield: 0.04, fiftyTwoWeekHigh: 195, fiftyTwoWeekLow: 130, analystTargetPrice: 180, analystRatings: { strongBuy: 3, buy: 8, hold: 10, sell: 4, strongSell: 1 }, beta: 0.95 },
  },
  "ATCO-A.STO": {
    quote: { symbol: "ATCO-A.STO", open: 188.5, high: 192.0, low: 187.2, price: 190.8, volume: 3100000, latestTradingDay: new Date().toISOString().split("T")[0], previousClose: 187.0, change: 3.8, changePercent: "+2.03%" },
    overview: { symbol: "ATCO-A.STO", name: "Atlas Copco A", description: "Atlas Copco - global industrial company, compressors and vacuum solutions", sector: "Industrials", industry: "Industrial Machinery", marketCap: 680000000000, peRatio: 28.5, forwardPE: 25.2, eps: 6.7, dividendYield: 0.017, fiftyTwoWeekHigh: 210, fiftyTwoWeekLow: 155, analystTargetPrice: 205, analystRatings: { strongBuy: 10, buy: 14, hold: 3, sell: 0, strongSell: 0 }, beta: 1.1 },
  },
};

function isSwedishStock(ticker: string): boolean {
  return ticker.endsWith(".STO");
}

function getSwedishQuote(ticker: string): { data: GlobalQuote; sources: SourceReference[] } {
  const mock = SWEDISH_STOCK_DATA[ticker];
  if (!mock) {
    return {
      data: { symbol: ticker, open: 0, high: 0, low: 0, price: 0, volume: 0, latestTradingDay: "", previousClose: 0, change: 0, changePercent: "0%" },
      sources: [{ title: `${ticker} Quote Data`, url: "#", source: "Mock Data (PoC)", type: "data" }],
    };
  }
  return {
    data: mock.quote,
    sources: [{ title: `${ticker} Quote Data`, url: `https://www.avanza.se/aktier/om-aktien.html/${ticker}`, source: "Mock Data (PoC)", type: "data" }],
  };
}

function getSwedishOverview(ticker: string): { data: CompanyOverview; sources: SourceReference[] } {
  const mock = SWEDISH_STOCK_DATA[ticker];
  if (!mock) {
    return {
      data: { symbol: ticker, name: ticker, description: "", sector: "", industry: "", marketCap: 0, peRatio: 0, forwardPE: 0, eps: 0, dividendYield: 0, fiftyTwoWeekHigh: 0, fiftyTwoWeekLow: 0, analystTargetPrice: 0, analystRatings: { strongBuy: 0, buy: 0, hold: 0, sell: 0, strongSell: 0 }, beta: 0 },
      sources: [{ title: `${ticker} Company Fundamentals`, url: "#", source: "Mock Data (PoC)", type: "fundamental" }],
    };
  }
  return {
    data: mock.overview,
    sources: [{ title: `${ticker} Company Fundamentals`, url: `https://www.avanza.se/aktier/om-aktien.html/${ticker}`, source: "Mock Data (PoC)", type: "fundamental" }],
  };
}

// Forex
export async function getUsdToSek(): Promise<number> {
  return cachedFetch<number>("FOREX:USD_SEK", TTL.GLOBAL_QUOTE, async () => {
    try {
      const raw = await fetchAV({ function: "CURRENCY_EXCHANGE_RATE", from_currency: "USD", to_currency: "SEK" });
      const rate = parseFloat(raw?.["Realtime Currency Exchange Rate"]?.["5. Exchange Rate"] || "0");
      return {
        data: rate > 0 ? rate : 10.5,
        sources: [{ title: "USD/SEK Exchange Rate", url: "https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=SEK", source: "Alpha Vantage", type: "data" }],
      };
    } catch {
      return {
        data: 10.5,
        sources: [{ title: "USD/SEK Exchange Rate (fallback)", url: "#", source: "Fallback", type: "data" }],
      };
    }
  }).then((r) => r.data);
}

export function getCacheStatus() {
  checkDailyReset();
  return {
    entries: cache.size,
    dailyRequestsUsed: dailyRequestCount,
    dailyRequestsRemaining: Math.max(0, 25 - dailyRequestCount),
  };
}
