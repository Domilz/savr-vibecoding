import { useState } from "react";
import { api } from "../api/client";
import type { BriefingResult } from "../types";

export function useBriefing() {
  const [briefing, setBriefing] = useState<BriefingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateBriefing = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.post<BriefingResult>("/briefing/generate");
      setBriefing(result);
    } catch (err: any) {
      setError(err.message || "Failed to generate briefing");
    } finally {
      setLoading(false);
    }
  };

  return { briefing, loading, error, generateBriefing };
}
