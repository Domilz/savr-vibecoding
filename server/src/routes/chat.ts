import { Router } from "express";
import { z } from "zod/v4";
import { chat, ChatMessage, buildPortfolioContext, MarketDataBundle } from "../services/claude";
import { getPortfolio } from "../services/portfolioStore";
import { getWatchlists, createWatchlist, addToWatchlist } from "../services/watchlistStore";
import * as av from "../services/alphaVantage";

const router = Router();

// In-memory cache of last fetched market data for chat context
let cachedMarketData: Map<string, MarketDataBundle> | null = null;
let lastMarketFetch = 0;

async function getMarketContext(): Promise<Map<string, MarketDataBundle>> {
  if (cachedMarketData && Date.now() - lastMarketFetch < 5 * 60 * 1000) {
    return cachedMarketData;
  }

  const portfolio = getPortfolio();
  const data = new Map<string, MarketDataBundle>();

  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
  for (const h of portfolio.holdings) {
    try {
      const quote = await av.getQuote(h.ticker);
      await delay(1200);
      const overview = await av.getOverview(h.ticker);
      await delay(1200);
      const news = await av.getNewsSentiment(h.ticker);
      await delay(1200);
      data.set(h.ticker, { quote: quote.data, overview: overview.data, news: news.data });
    } catch {
      // Skip holdings that fail
    }
  }

  cachedMarketData = data;
  lastMarketFetch = Date.now();
  return data;
}

function buildWatchlistContext(): string {
  const lists = getWatchlists();
  if (lists.length === 0) return "";
  let ctx = "## Bevakningslistor\n";
  for (const wl of lists) {
    ctx += `- Lista "${wl.name}" (id: ${wl.id}): ${wl.items.map((i) => `${i.ticker} (${i.name})`).join(", ")}\n`;
  }
  return ctx;
}

function parseAction(reply: string): { cleanReply: string; action: any | null } {
  const actionMatch = reply.match(/---ACTION---\s*([\s\S]*?)\s*---END_ACTION---/);
  if (!actionMatch) return { cleanReply: reply, action: null };

  const cleanReply = reply.replace(/---ACTION---[\s\S]*?---END_ACTION---/, "").trim();
  try {
    const action = JSON.parse(actionMatch[1].trim());
    return { cleanReply, action };
  } catch {
    return { cleanReply, action: null };
  }
}

async function executeAction(action: any): Promise<any> {
  switch (action.type) {
    case "create_watchlist": {
      const wl = createWatchlist(action.name, action.items || [], "ai");
      return { type: "create_watchlist", watchlist: wl };
    }
    case "add_to_watchlist": {
      const wl = addToWatchlist(action.watchlistId, action.items || []);
      return { type: "add_to_watchlist", watchlist: wl };
    }
    default:
      return null;
  }
}

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1),
});

const chatSchema = z.object({
  messages: z.array(messageSchema).min(1),
});

router.post("/", async (req, res) => {
  const result = chatSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: "Invalid request", details: result.error.issues });
    return;
  }

  try {
    const portfolio = getPortfolio();
    const marketData = await getMarketContext();
    const watchlistCtx = buildWatchlistContext();
    const context = buildPortfolioContext(portfolio, marketData, watchlistCtx);
    const rawReply = await chat(result.data.messages as ChatMessage[], context);

    const { cleanReply, action } = parseAction(rawReply);
    let actionResult = null;
    if (action) {
      actionResult = await executeAction(action);
    }

    res.json({ reply: cleanReply, action: actionResult });
  } catch (error: any) {
    console.error("Chat failed:", error);
    res.status(500).json({ error: "Chat failed", message: error.message });
  }
});

export default router;
