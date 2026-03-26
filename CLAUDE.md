# Finance Portfolio Assistant PoC

AI-powered finance app PoC inspired by Avanza/Nordnet. An LLM wrapper sits between the user's portfolio and market data, providing daily briefings, conversational analysis, fund fee comparison via SAVR, and AI-driven watchlist creation.

## Tech Stack

- **Backend**: Node.js + Express + TypeScript (port 3001)
- **Frontend**: Vite + React + TypeScript + Tailwind CSS (port 5173 in dev, served by Express in production)
- **LLM**: Anthropic Claude API
  - `claude-sonnet-4-20250514` — portfolio briefings, chat, and AI actions
  - `claude-haiku-4-5` — SAVR fee analysis (speed/cost optimized)
- **Market Data**: Alpha Vantage API (free tier, 25 req/day with in-memory caching)
- **Storage**: In-memory only (no database)
- **UI**: Mobile-first dark mode, Swedish language, bottom tab bar
- **Deployment**: Render free tier (single service, `render.yaml` included)

## Project Structure

```
poc/
├── .env                    # API keys (ANTHROPIC_API_KEY, ALPHAVANTAGE_API_KEY)
├── package.json            # Root build/start scripts for production
├── render.yaml             # Render deployment config
├── server/
│   └── src/
│       ├── index.ts        # Entry point, routes, static file serving
│       ├── config.ts       # Env loader
│       ├── data/
│       │   └── funds.ts    # Hardcoded Swedish fund data (SAVR/Avanza/Nordnet fees)
│       ├── routes/
│       │   ├── portfolio.ts  # GET/PUT /api/portfolio
│       │   ├── briefing.ts   # POST /api/briefing/generate
│       │   ├── market.ts     # GET /api/market/cache-status, /exchange-rate
│       │   ├── chat.ts       # POST /api/chat (with action parsing)
│       │   ├── savr.ts       # GET /api/savr/funds, POST /api/savr/analyze
│       │   └── watchlist.ts  # CRUD /api/watchlists
│       ├── services/
│       │   ├── alphaVantage.ts         # AV client + cache + Swedish stock mocks
│       │   ├── claude.ts               # Anthropic SDK, system prompts, action instructions
│       │   ├── briefingOrchestrator.ts # Ties AV data + Claude for portfolio analysis
│       │   ├── portfolioStore.ts       # In-memory portfolio CRUD with mock data
│       │   ├── savrInsightEngine.ts    # Compound interest calc + Haiku fee analysis
│       │   └── watchlistStore.ts       # In-memory watchlist store
│       └── types/
├── client/
│   └── src/
│       ├── App.tsx         # Mobile shell, tab router, action wiring
│       ├── api/client.ts   # Fetch wrapper
│       ├── components/
│       │   ├── TabBar.tsx  # Bottom navigation (5 tabs, AI logo for VibeCheck)
│       │   └── tabs/
│       │       ├── HemTab.tsx        # Dashboard (mocked)
│       │       ├── InnehavTab.tsx    # Live portfolio, multi-currency
│       │       ├── VibeCheckTab.tsx  # Core: Chatt, Analys, Avgifter
│       │       ├── BevakaTab.tsx     # Live watchlists (AI-created + manual)
│       │       └── UpptackTab.tsx    # Discovery (mocked)
│       ├── hooks/
│       │   ├── usePortfolio.ts
│       │   ├── useBriefing.ts
│       │   ├── useChat.ts           # Supports action callbacks
│       │   ├── useSavr.ts
│       │   └── useWatchlists.ts
│       └── types/index.ts
```

## Running

### Development (hot reload)

```bash
# Terminal 1 - backend
cd server && npm run dev

# Terminal 2 - frontend
cd client && npm run dev
```

Open http://localhost:5173

### Production (single server)

```bash
npm run build
npm start
```

Open http://localhost:3001

## App Tabs

- **Hem** — Dashboard with portfolio value in SEK, market indices, news (mocked)
- **Innehav** — Editable portfolio with US and Swedish stocks, allocation bars, total value in SEK
- **VibeCheck** — Core AI feature with three modes:
  - **Chatt** (default) — Free-form AI conversation + AI actions (e.g. watchlist creation)
  - **Analys** — Structured daily briefing with sentiment, price targets, risks, source transparency
  - **Avgifter** — SAVR fund fee comparison with searchable dropdown, Avanza/Nordnet/custom fee, compound interest calculator
- **Bevaka** — Multiple watchlists (AI-created or manual), collapsible, delete/remove items
- **Upptäck** — Discovery page with categories and trending stocks (mocked)

## Key Design Decisions

- **Swedish UI**: All user-facing text and AI responses are in Swedish.
- **Mobile-first dark mode**: App mimics a mobile finance app (max-w-md, bottom tab bar, dark palette).
- **Alpha Vantage caching**: In-memory cache with TTLs (4h quotes, 24h fundamentals, 2h news). Sequential requests with 1.2s delays to respect free tier burst limit.
- **Source transparency**: Every AV fetch records a SourceReference. Claude's system prompt requires citing sources. UI shows clickable source links.
- **SAVR fee analysis**: Compound interest formula A=P(1+r)^n at 7% annual return over 10/20 years. 12 popular Swedish funds hardcoded.
- **Dual LLM strategy**: Sonnet for complex analysis and actions, Haiku for fast fee comparisons.
- **Multi-currency**: Holdings in USD or SEK. Portfolio total in SEK via live USD/SEK rate. Swedish stocks (`.STO`) use mock data.
- **AI Actions**: Chat system prompt includes action instructions. Claude embeds `---ACTION---` blocks for watchlist creation. Backend parses and executes them, frontend refreshes.
- **Single-service deployment**: Express serves built Vite assets in production. One URL, one process.

## API Endpoints

- `GET /api/portfolio` — Get current portfolio
- `PUT /api/portfolio` — Update holdings
- `POST /api/briefing/generate` — Generate full portfolio analysis (Sonnet)
- `POST /api/chat` — Chat with AI (supports actions, returns `{ reply, action? }`)
- `GET /api/market/cache-status` — Alpha Vantage cache/rate-limit info
- `GET /api/market/exchange-rate` — Live USD/SEK exchange rate
- `GET /api/savr/funds` — List funds with SAVR/Avanza/Nordnet fees
- `POST /api/savr/analyze` — Analyze fund fee savings (Haiku)
- `GET /api/watchlists` — List all watchlists
- `POST /api/watchlists` — Create watchlist
- `DELETE /api/watchlists/:id` — Delete watchlist
- `POST /api/watchlists/:id/items` — Add items to watchlist
- `DELETE /api/watchlists/:id/items/:ticker` — Remove item

## Test Scripts

```bash
# Test SAVR insight engine standalone
cd server && npx tsx src/test-savr.ts
```
