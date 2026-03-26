import { useState, useEffect, useCallback } from "react";
import { api } from "../api/client";
import type { Portfolio, Holding } from "../types";

export function usePortfolio() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPortfolio = useCallback(async () => {
    try {
      const data = await api.get<Portfolio>("/portfolio");
      setPortfolio(data);
    } catch (err) {
      console.error("Failed to fetch portfolio:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const updatePortfolio = async (holdings: Holding[]) => {
    const data = await api.put<Portfolio>("/portfolio", { holdings });
    setPortfolio(data);
  };

  const addHolding = async (holding: Holding) => {
    if (!portfolio) return;
    await updatePortfolio([...portfolio.holdings, holding]);
  };

  const removeHolding = async (ticker: string) => {
    if (!portfolio) return;
    await updatePortfolio(portfolio.holdings.filter((h) => h.ticker !== ticker));
  };

  return { portfolio, loading, updatePortfolio, addHolding, removeHolding };
}
