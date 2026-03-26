# Finance Portfolio Assistant PoC

An AI-powered finance app inspired by Avanza and Nordnet. Uses Claude as an intelligent layer between the user's portfolio and market data to provide daily briefings, conversational analysis, fund fee comparison, and AI-driven watchlist creation.

## Features

- **AI Chat** — Ask questions about your portfolio in Swedish, powered by Claude Sonnet
- **AI Actions** — The AI can perform actions in the app (e.g. "Skapa en bevakningslista med nordiska teknikaktier" creates a watchlist in the Bevaka tab)
- **Portfolio Analysis** — Structured daily briefing with sentiment, price targets, risk factors, and transparent source links
- **SAVR Fee Comparison** — Compare fund fees between SAVR, Avanza, and Nordnet with compound interest savings over 10/20 years
- **Multi-currency Portfolio** — US stocks (USD) and Swedish stocks (SEK) with live USD/SEK exchange rate, total value in SEK
- **Mobile-first UI** — Dark mode, Swedish language, bottom tab navigation

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Anthropic API key](https://console.anthropic.com/)
- [Alpha Vantage API key](https://www.alphavantage.co/support/#api-key) (free tier works)

## Setup

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USER/finance-poc.git
cd finance-poc

# Install all dependencies (client + server)
npm run build
```

### 2. Configure API keys

Create a `.env` file in the project root:

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
ALPHAVANTAGE_API_KEY=your-key-here
PORT=3001
```

### 3. Run

#### Option A: Production mode (single server)

```bash
npm run build
npm start
```

Open **http://localhost:3001**

#### Option B: Development mode (hot reload)

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

Open **http://localhost:5173**

## Deployment (Render — free)

The app is configured for one-click deployment on [Render](https://render.com):

1. Push to a GitHub repository
2. Go to Render → New → Web Service → Connect your repo
3. Render auto-detects `render.yaml` — just add your env vars:
   - `ANTHROPIC_API_KEY`
   - `ALPHAVANTAGE_API_KEY`
4. Deploy — you'll get a URL like `finance-poc.onrender.com`

The free tier sleeps after 15 min of inactivity (~30s cold start on first visit).

## Usage

### VibeCheck (main feature)

The VibeCheck tab has three modes:

| Mode | Description |
|------|-------------|
| **Chatt** | Free-form AI conversation. Ask questions or give commands like "Skapa en bevakningslista med svenska bankaktier" |
| **Analys** | Generates a structured briefing with per-holding sentiment, price target ranges, risk factors, and clickable source links |
| **Avgifter** | Search for a Swedish fund, compare fees across SAVR/Avanza/Nordnet, and see compound interest savings over 10-20 years |

### Other tabs

- **Hem** — Dashboard with portfolio value in SEK, market indices, news (mocked)
- **Innehav** — Portfolio with US and Swedish stocks, editable, all values in SEK
- **Bevaka** — Multiple watchlists (AI-created or manual), collapsible, with currency badges
- **Upptäck** — Fund discovery with categories and trending stocks (mocked)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite, React, TypeScript, Tailwind CSS |
| Backend | Express, TypeScript |
| LLM | Claude Sonnet (analysis, chat, actions), Claude Haiku (fee analysis) |
| Market Data | Alpha Vantage API |
| Deployment | Render (free tier) |

## Alpha Vantage Rate Limits

The free tier allows 25 requests/day with a 1 request/second burst limit. The app handles this with:

- In-memory caching (4h for quotes, 24h for fundamentals, 2h for news)
- Sequential requests with 1.2s delays between calls
- Cache status indicator visible in the app

US holdings use ~10 API calls on first analysis, then mostly cache hits. Swedish stocks (`.STO` tickers) use mock data — no API calls consumed.

## Multi-Currency Support

Holdings can be USD or SEK. US stocks are fetched from Alpha Vantage, Swedish stocks use hardcoded mock data (AV free tier doesn't support Stockholm exchange). A live USD/SEK exchange rate is fetched for portfolio totals. All values displayed in SEK.

## AI Actions

The chat AI can perform actions within the app. Currently supported:

- **create_watchlist** — Creates a new watchlist in the Bevaka tab (e.g. "Skapa en lista med nordiska teknikaktier")
- **add_to_watchlist** — Adds stocks to an existing watchlist

Actions are executed server-side via structured `---ACTION---` blocks that Claude embeds in its responses. The frontend detects the action and refreshes the relevant UI.

## Project Structure

```
poc/
├── .env                          # API keys
├── package.json                  # Root build/start scripts
├── render.yaml                   # Render deployment config
├── server/
│   └── src/
│       ├── index.ts              # Express entry + static file serving
│       ├── config.ts             # Environment config
│       ├── data/funds.ts         # Swedish fund fee data
│       ├── routes/
│       │   ├── portfolio.ts
│       │   ├── briefing.ts
│       │   ├── market.ts
│       │   ├── chat.ts           # Chat + action parsing
│       │   ├── savr.ts
│       │   └── watchlist.ts      # Watchlist CRUD
│       ├── services/
│       │   ├── alphaVantage.ts   # Market data with caching + Swedish stock mocks
│       │   ├── claude.ts         # Anthropic SDK, system prompts, action instructions
│       │   ├── briefingOrchestrator.ts
│       │   ├── portfolioStore.ts
│       │   ├── savrInsightEngine.ts
│       │   └── watchlistStore.ts # In-memory watchlist store
│       └── types/
├── client/
│   └── src/
│       ├── App.tsx               # Mobile shell + tab router + action wiring
│       ├── components/
│       │   ├── TabBar.tsx
│       │   └── tabs/             # HemTab, InnehavTab, VibeCheckTab, BevakaTab, UpptackTab
│       ├── hooks/                # usePortfolio, useBriefing, useChat, useSavr, useWatchlists
│       └── types/
```

## API Endpoints

```
GET  /api/portfolio            — Get portfolio
PUT  /api/portfolio            — Update holdings
POST /api/briefing/generate    — Generate portfolio analysis
POST /api/chat                 — Chat with AI (supports actions)
GET  /api/market/cache-status  — Cache and rate limit info
GET  /api/market/exchange-rate — Live USD/SEK exchange rate
GET  /api/savr/funds           — List funds with fee data
POST /api/savr/analyze         — Analyze fund fee savings
GET  /api/watchlists           — List all watchlists
POST /api/watchlists           — Create watchlist
DELETE /api/watchlists/:id     — Delete watchlist
POST /api/watchlists/:id/items — Add items to watchlist
DELETE /api/watchlists/:id/items/:ticker — Remove item
```
