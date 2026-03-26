import { useState, useEffect } from "react";
import { api } from "../../api/client";
import type { CacheStatus as CacheStatusType } from "../../types";

export function CacheStatus() {
  const [status, setStatus] = useState<CacheStatusType | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await api.get<CacheStatusType>("/market/cache-status");
        setStatus(data);
      } catch {
        // ignore
      }
    };
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!status) return null;

  const remaining = status.dailyRequestsRemaining;
  const color =
    remaining > 15 ? "bg-green-100 text-green-800" :
    remaining > 5 ? "bg-yellow-100 text-yellow-800" :
    "bg-red-100 text-red-800";

  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${color}`}>
      AV: {status.dailyRequestsUsed}/25 used
    </span>
  );
}
