import Anthropic from "@anthropic-ai/sdk";
import { config } from "../config";
import { Portfolio } from "../types/portfolio";
import { GlobalQuote, CompanyOverview, NewsArticle, TopGainersLosers } from "../types/market";

const client = new Anthropic({ apiKey: config.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a senior portfolio analyst providing a daily briefing to an individual investor.

RULES:
1. Base ALL analysis on the provided market data. Do not invent prices, metrics, or news.
2. For every claim, reference the data source (e.g., "Per Alpha Vantage quote data..." or "According to [article title]...").
3. When providing price targets, clearly state these are INDICATIVE ranges based on analyst consensus data and current fundamentals — not financial advice.
4. Rate sentiment as "bullish", "bearish", or "neutral" for each holding.
5. Identify cross-portfolio risk factors (sector concentration, correlation, macro exposure).
6. Keep language clear and jargon-free.

RESPOND IN THIS EXACT JSON STRUCTURE (no markdown, no code fences, just raw JSON):
{
  "marketSummary": "2-3 sentence overview of market conditions today",
  "holdings": [
    {
      "ticker": "AAPL",
      "name": "Apple Inc.",
      "sentiment": "bullish|bearish|neutral",
      "sentimentReason": "Brief explanation referencing specific data",
      "priceTargetLow": 170.00,
      "priceTargetMid": 185.00,
      "priceTargetHigh": 200.00,
      "keyRisks": ["Risk 1 with source", "Risk 2 with source"],
      "sourcesUsed": ["source description 1", "source description 2"]
    }
  ],
  "overallRiskFactors": ["Portfolio-level risk 1", "Portfolio-level risk 2"],
  "disclaimer": "This is AI-generated analysis for informational purposes only, not financial advice."
}`;

export interface MarketDataBundle {
  quote: GlobalQuote;
  overview: CompanyOverview;
  news: NewsArticle[];
}

export function buildPrompt(
  portfolio: Portfolio,
  marketData: Map<string, MarketDataBundle>,
  topGainersLosers: TopGainersLosers | null
): string {
  let prompt = "Here is the investor's current portfolio and latest market data.\n\n";

  // Portfolio table
  prompt += "## Portfolio\n";
  prompt += "| Ticker | Shares | Avg Cost | Current Price | P&L |\n";
  prompt += "|--------|--------|----------|---------------|-----|\n";
  for (const h of portfolio.holdings) {
    const md = marketData.get(h.ticker);
    const price = md?.quote.price ?? 0;
    const pl = ((price - h.avgCostBasis) * h.shares).toFixed(2);
    const sign = parseFloat(pl) >= 0 ? "+" : "";
    prompt += `| ${h.ticker} | ${h.shares} | $${h.avgCostBasis.toFixed(2)} | $${price.toFixed(2)} | ${sign}$${pl} |\n`;
  }

  // Per-holding data
  for (const h of portfolio.holdings) {
    const md = marketData.get(h.ticker);
    if (!md) continue;

    prompt += `\n### ${h.ticker} — ${md.overview.name || h.name || h.ticker}\n`;
    prompt += `**Quote:** Price: $${md.quote.price.toFixed(2)}, Change: ${md.quote.changePercent}, Volume: ${md.quote.volume.toLocaleString()}\n`;
    prompt += `**Fundamentals:** P/E: ${md.overview.peRatio}, Forward P/E: ${md.overview.forwardPE}, Analyst Target: $${md.overview.analystTargetPrice}, Beta: ${md.overview.beta}\n`;
    prompt += `**Analyst Ratings:** Strong Buy: ${md.overview.analystRatings.strongBuy}, Buy: ${md.overview.analystRatings.buy}, Hold: ${md.overview.analystRatings.hold}, Sell: ${md.overview.analystRatings.sell}, Strong Sell: ${md.overview.analystRatings.strongSell}\n`;
    prompt += `**52-Week Range:** $${md.overview.fiftyTwoWeekLow} — $${md.overview.fiftyTwoWeekHigh}\n`;

    if (md.news.length > 0) {
      prompt += "**Recent News:**\n";
      for (const article of md.news) {
        prompt += `- "${article.title}" — ${article.source}, Sentiment: ${article.overallSentiment} (${article.overallSentimentScore.toFixed(2)}) — URL: ${article.url}\n`;
      }
    }
  }

  // Market overview
  if (topGainersLosers) {
    prompt += "\n## Market Overview\n";
    prompt += "**Top Gainers:** " + topGainersLosers.topGainers.map((g) => `${g.ticker} (${g.changePercentage})`).join(", ") + "\n";
    prompt += "**Top Losers:** " + topGainersLosers.topLosers.map((l) => `${l.ticker} (${l.changePercentage})`).join(", ") + "\n";
  }

  prompt += "\nPlease generate the daily briefing analysis.";
  return prompt;
}

export async function analyze(userMessage: string): Promise<any> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    temperature: 0.3,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");

  // Try to parse JSON response
  try {
    return JSON.parse(text);
  } catch {
    // Try to extract JSON from markdown fences
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        // Fall through
      }
    }
    return { raw: text, parseError: true };
  }
}

const CHAT_SYSTEM_PROMPT = `Du är en AI-driven portföljrådgivare i en svensk finansapp. Du svarar alltid på svenska.

Du har tillgång till användarens portfölj och marknadsdata som tillhandahålls i konversationen.

REGLER:
1. Svara alltid på svenska.
2. Basera ALL analys på tillhandahållen marknadsdata. Hitta inte på priser, nyckeltal eller nyheter.
3. Referera till datakällor när du gör påståenden.
4. Var tydlig med att detta INTE är finansiell rådgivning.
5. Var koncis men informativ. Använd ett vänligt, professionellt tonfall.
6. Om användaren frågar om något utanför din data, var ärlig med det.
7. Du kan använda markdown för formatering (fetstil, listor, etc).

ÅTGÄRDER:
Du kan utföra åtgärder i appen. När användaren ber dig skapa en bevakningslista, lägga till aktier att bevaka, eller hantera bevakningslistor, inkludera ett ACTION-block i ditt svar EFTER din text:

---ACTION---
{"type": "create_watchlist", "name": "Listnamn", "items": [{"ticker": "VOLV-B.STO", "name": "Volvo B", "currency": "SEK"}]}
---END_ACTION---

Tillgängliga åtgärder:
- create_watchlist: Skapa ny bevakningslista. JSON: { "type": "create_watchlist", "name": string, "items": [{ "ticker": string, "name": string, "currency": "USD" | "SEK" }] }
- add_to_watchlist: Lägg till aktier i befintlig lista. JSON: { "type": "add_to_watchlist", "watchlistId": string, "items": [{ "ticker": string, "name": string, "currency": "USD" | "SEK" }] }

VIKTIGT om åtgärder:
- Svenska aktier (Stockholmsbörsen) har ticker som slutar på .STO (t.ex. VOLV-B.STO) och currency "SEK"
- Amerikanska aktier har vanliga tickers (t.ex. AAPL) och currency "USD"
- Skriv alltid en förklarande text FÖRE action-blocket
- Placera action-blocket SIST i ditt svar
- Användarens befintliga bevakningslistor tillhandahålls i kontexten`;

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function chat(
  messages: ChatMessage[],
  portfolioContext: string
): Promise<string> {
  const systemWithContext = `${CHAT_SYSTEM_PROMPT}\n\n## Användarens portfölj och marknadsdata:\n${portfolioContext}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    temperature: 0.5,
    system: systemWithContext,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");
}

export function buildPortfolioContext(
  portfolio: Portfolio,
  marketData: Map<string, MarketDataBundle> | null,
  watchlistInfo?: string
): string {
  let ctx = "## Portfölj\n";
  for (const h of portfolio.holdings) {
    const md = marketData?.get(h.ticker);
    if (md) {
      const pl = ((md.quote.price - h.avgCostBasis) * h.shares).toFixed(2);
      ctx += `- ${h.ticker} (${md.overview.name}): ${h.shares} st @ $${h.avgCostBasis} | Nuvarande: $${md.quote.price.toFixed(2)} | P&L: $${pl}\n`;
      ctx += `  P/E: ${md.overview.peRatio}, Analytikers mål: $${md.overview.analystTargetPrice}, Beta: ${md.overview.beta}\n`;
      if (md.news.length > 0) {
        ctx += `  Senaste nyheter: ${md.news.slice(0, 2).map(n => `"${n.title}" (${n.overallSentiment})`).join(", ")}\n`;
      }
    } else {
      ctx += `- ${h.ticker}: ${h.shares} st @ $${h.avgCostBasis}\n`;
    }
  }
  if (watchlistInfo) {
    ctx += "\n" + watchlistInfo;
  }
  return ctx;
}
