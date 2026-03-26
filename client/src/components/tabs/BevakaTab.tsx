import { useState } from "react";
import { useWatchlists } from "../../hooks/useWatchlists";
import type { Watchlist } from "../../types";

export function BevakaTab({ refreshKey }: { refreshKey?: number }) {
  const { watchlists, loading, deleteWatchlist, removeItem } = useWatchlists(refreshKey);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-2 pb-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">Bevakningslistor</h1>
        <span className="text-xs text-gray-500">{watchlists.length} listor</span>
      </div>

      {watchlists.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-gray-400">Inga bevakningslistor ännu.</p>
          <p className="text-xs text-gray-500 mt-1">Be AI:n skapa en i chatten!</p>
        </div>
      )}

      {watchlists.map((wl) => (
        <WatchlistCard
          key={wl.id}
          watchlist={wl}
          expanded={expandedId === wl.id}
          onToggle={() => setExpandedId(expandedId === wl.id ? null : wl.id)}
          onDelete={() => deleteWatchlist(wl.id)}
          onRemoveItem={(ticker) => removeItem(wl.id, ticker)}
        />
      ))}

      <div className="bg-dark-700 rounded-2xl p-4 space-y-2">
        <p className="text-xs text-gray-400 uppercase tracking-wider">Prisaviseringar</p>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-300">TSLA &gt; $200</span>
          <span className="text-xs bg-accent/20 text-accent-light px-2 py-0.5 rounded-full">Aktiv</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-300">INVE-B &gt; 280 kr</span>
          <span className="text-xs bg-accent/20 text-accent-light px-2 py-0.5 rounded-full">Aktiv</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-300">SAND &lt; 200 kr</span>
          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">Nära</span>
        </div>
      </div>

      <div className="bg-dark-600 border border-dark-500 rounded-2xl p-4 text-center">
        <p className="text-xs text-gray-400">Tips: Gå till VibeCheck → Chatt och be AI:n skapa en bevakningslista!</p>
        <p className="text-[10px] text-gray-500 mt-1">T.ex. "Skapa en lista med nordiska teknikaktier"</p>
      </div>
    </div>
  );
}

function WatchlistCard({
  watchlist: wl,
  expanded,
  onToggle,
  onDelete,
  onRemoveItem,
}: {
  watchlist: Watchlist;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onRemoveItem: (ticker: string) => void;
}) {
  return (
    <div className="bg-dark-700 rounded-2xl overflow-hidden">
      <button onClick={onToggle} className="w-full text-left p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">{wl.name}</span>
            {wl.createdBy === "ai" && (
              <span className="text-[9px] bg-accent/20 text-accent-light px-1.5 py-0.5 rounded font-medium">AI</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{wl.items.length} aktier</span>
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform ${expanded ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-2">
          {wl.items.map((item) => (
            <div key={item.ticker} className="flex justify-between items-center py-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">{item.ticker.replace(".STO", "")}</span>
                <span className="text-xs text-gray-500">{item.name}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                  item.currency === "SEK" ? "bg-blue-500/20 text-blue-400" : "bg-green-500/20 text-green-400"
                }`}>
                  {item.currency}
                </span>
              </div>
              <button
                onClick={() => onRemoveItem(item.ticker)}
                className="text-gray-600 hover:text-loss text-xs"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}

          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="w-full mt-2 py-2 text-xs text-loss/70 hover:text-loss border border-dark-500 rounded-xl transition-colors"
          >
            Ta bort lista
          </button>
        </div>
      )}
    </div>
  );
}
