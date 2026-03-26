import { useState, useEffect } from "react";
import { usePortfolio } from "../../hooks/usePortfolio";
import { api } from "../../api/client";

export function InnehavTab() {
  const { portfolio, loading, addHolding } = usePortfolio();
  const [usdToSek, setUsdToSek] = useState(10.5);

  useEffect(() => {
    api.get<{ usdToSek: number }>("/market/exchange-rate")
      .then((r) => setUsdToSek(r.usdToSek))
      .catch(() => {});
  }, []);

  if (loading || !portfolio) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  const fmt = (n: number) => n.toLocaleString("sv-SE", { maximumFractionDigits: 0 });

  // Calculate total portfolio value in SEK
  const totalValueSek = portfolio.holdings.reduce((sum, h) => {
    const value = h.shares * h.avgCostBasis;
    return sum + (h.currency === "USD" ? value * usdToSek : value);
  }, 0);

  return (
    <div className="px-4 pt-2 pb-4 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white">Innehav</h1>
        <p className="text-xs text-gray-400 mt-0.5">{portfolio.holdings.length} positioner</p>
      </div>

      <div className="bg-dark-700 rounded-2xl p-4">
        <p className="text-xs text-gray-400 uppercase tracking-wider">Totalt anskaffningsvärde</p>
        <p className="text-2xl font-bold text-white mt-1">{fmt(totalValueSek)} kr</p>
        <p className="text-[10px] text-gray-500 mt-0.5">USD/SEK: {usdToSek.toFixed(2)}</p>
      </div>

      <div className="space-y-2">
        {portfolio.holdings.map((h) => {
          const valueNative = h.shares * h.avgCostBasis;
          const valueSek = h.currency === "USD" ? valueNative * usdToSek : valueNative;
          const pct = ((valueSek / totalValueSek) * 100).toFixed(1);
          return (
            <div key={h.ticker} className="bg-dark-700 rounded-2xl p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{h.ticker.replace(".STO", "")}</span>
                    <span className="text-xs text-gray-500">{h.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                      h.currency === "SEK" ? "bg-blue-500/20 text-blue-400" : "bg-green-500/20 text-green-400"
                    }`}>
                      {h.currency}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {h.shares} st @ {h.currency === "SEK" ? `${h.avgCostBasis.toFixed(2)} kr` : `$${h.avgCostBasis.toFixed(2)}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{fmt(valueSek)} kr</p>
                  {h.currency === "USD" && (
                    <p className="text-[10px] text-gray-500">${fmt(valueNative)}</p>
                  )}
                  <p className="text-[10px] text-gray-500">{pct}% av portfölj</p>
                </div>
              </div>
              <div className="mt-2 h-1 bg-dark-500 rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => {
          const ticker = prompt("Ticker (t.ex. TSLA eller VOLV-B.STO):");
          if (!ticker) return;
          const shares = parseFloat(prompt("Antal aktier:") || "0");
          const cost = parseFloat(prompt("Genomsnittligt anskaffningspris:") || "0");
          const isSwedish = ticker.toUpperCase().endsWith(".STO");
          const currency = isSwedish ? "SEK" : "USD";
          if (shares > 0 && cost > 0) {
            addHolding({ ticker: ticker.toUpperCase(), shares, avgCostBasis: cost, currency });
          }
        }}
        className="w-full py-3 bg-dark-600 border border-dark-500 rounded-2xl text-sm text-gray-400 hover:text-white hover:border-accent transition-colors"
      >
        + Lägg till innehav
      </button>
    </div>
  );
}
