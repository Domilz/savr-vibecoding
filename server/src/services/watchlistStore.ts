export interface WatchlistItem {
  ticker: string;
  name: string;
  currency: "USD" | "SEK";
}

export interface Watchlist {
  id: string;
  name: string;
  items: WatchlistItem[];
  createdAt: string;
  createdBy: "user" | "ai";
}

let nextId = 2;

const watchlists: Watchlist[] = [
  {
    id: "1",
    name: "Min bevakningslista",
    createdAt: new Date().toISOString(),
    createdBy: "user",
    items: [
      { ticker: "TSLA", name: "Tesla Inc.", currency: "USD" },
      { ticker: "AMZN", name: "Amazon.com Inc.", currency: "USD" },
      { ticker: "SEB-A.STO", name: "SEB A", currency: "SEK" },
      { ticker: "INVE-B.STO", name: "Investor B", currency: "SEK" },
      { ticker: "SAND.STO", name: "Sandvik", currency: "SEK" },
      { ticker: "SPOT", name: "Spotify Technology", currency: "USD" },
      { ticker: "HEXA-B.STO", name: "Hexagon B", currency: "SEK" },
      { ticker: "SWED-A.STO", name: "Swedbank A", currency: "SEK" },
    ],
  },
];

export function getWatchlists(): Watchlist[] {
  return watchlists;
}

export function createWatchlist(name: string, items: WatchlistItem[], createdBy: "user" | "ai" = "user"): Watchlist {
  const wl: Watchlist = {
    id: String(nextId++),
    name,
    items,
    createdAt: new Date().toISOString(),
    createdBy,
  };
  watchlists.push(wl);
  return wl;
}

export function deleteWatchlist(id: string): boolean {
  const idx = watchlists.findIndex((w) => w.id === id);
  if (idx === -1) return false;
  watchlists.splice(idx, 1);
  return true;
}

export function addToWatchlist(id: string, items: WatchlistItem[]): Watchlist | null {
  const wl = watchlists.find((w) => w.id === id);
  if (!wl) return null;
  for (const item of items) {
    if (!wl.items.some((i) => i.ticker === item.ticker)) {
      wl.items.push(item);
    }
  }
  return wl;
}

export function removeFromWatchlist(id: string, ticker: string): Watchlist | null {
  const wl = watchlists.find((w) => w.id === id);
  if (!wl) return null;
  wl.items = wl.items.filter((i) => i.ticker !== ticker);
  return wl;
}
