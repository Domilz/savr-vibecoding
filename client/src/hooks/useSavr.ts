import { useState } from "react";
import { api } from "../api/client";
import type { SavrPortfolio, SavrInsightResult } from "../types";

export function useSavr() {
  const [result, setResult] = useState<SavrInsightResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (portfolio: SavrPortfolio) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.post<SavrInsightResult>("/savr/analyze", portfolio);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Kunde inte analysera fonden");
    } finally {
      setLoading(false);
    }
  };

  return { result, loading, error, analyze };
}
