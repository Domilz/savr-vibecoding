import { useState, useEffect, useCallback } from "react";
import { api } from "../api/client";
import type { Watchlist } from "../types";

export function useWatchlists(refreshKey?: number) {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const data = await api.get<Watchlist[]>("/watchlists");
      setWatchlists(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch, refreshKey]);

  const deleteWatchlist = async (id: string) => {
    await api.get(`/watchlists/${id}`).catch(() => {});
    // Use DELETE via fetch directly
    await window.fetch(`/api/watchlists/${id}`, { method: "DELETE" });
    await fetch();
  };

  const removeItem = async (watchlistId: string, ticker: string) => {
    await window.fetch(`/api/watchlists/${watchlistId}/items/${encodeURIComponent(ticker)}`, { method: "DELETE" });
    await fetch();
  };

  return { watchlists, loading, refresh: fetch, deleteWatchlist, removeItem };
}
