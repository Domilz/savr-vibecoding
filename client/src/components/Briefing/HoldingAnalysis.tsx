import { useState } from "react";
import type { HoldingAnalysis as HoldingAnalysisType } from "../../types";

const sentimentConfig = {
  bullish: { bg: "bg-green-50", border: "border-green-200", badge: "bg-green-100 text-green-800", label: "Bullish" },
  bearish: { bg: "bg-red-50", border: "border-red-200", badge: "bg-red-100 text-red-800", label: "Bearish" },
  neutral: { bg: "bg-gray-50", border: "border-gray-200", badge: "bg-gray-100 text-gray-700", label: "Neutral" },
};

export function HoldingAnalysisCard({ holding }: { holding: HoldingAnalysisType }) {
  const [showSources, setShowSources] = useState(false);
  const cfg = sentimentConfig[holding.sentiment] || sentimentConfig.neutral;

  const range = holding.priceTargetHigh - holding.priceTargetLow;
  const currentPos = range > 0
    ? ((holding.currentPrice - holding.priceTargetLow) / range) * 100
    : 50;

  return (
    <div className={`${cfg.bg} border ${cfg.border} rounded-lg p-4 space-y-3`}>
      <div className="flex items-center justify-between">
        <div>
          <span className="font-bold text-gray-900 text-lg">{holding.ticker}</span>
          <span className="text-gray-500 text-sm ml-2">{holding.name}</span>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${cfg.badge}`}>
          {cfg.label}
        </span>
      </div>

      <p className="text-sm text-gray-700">{holding.sentimentReason}</p>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-500">
          <span>${holding.priceTargetLow.toFixed(2)}</span>
          <span className="font-medium text-gray-900">Current: ${holding.currentPrice.toFixed(2)}</span>
          <span>${holding.priceTargetHigh.toFixed(2)}</span>
        </div>
        <div className="relative h-2 bg-gray-200 rounded-full">
          <div
            className="absolute h-2 bg-blue-400 rounded-full"
            style={{ left: "0%", width: `${Math.min(100, Math.max(0, currentPos))}%` }}
          />
          <div
            className="absolute w-3 h-3 bg-blue-600 rounded-full -top-0.5 border-2 border-white"
            style={{ left: `${Math.min(100, Math.max(0, currentPos))}%`, transform: "translateX(-50%)" }}
          />
        </div>
        <div className="text-center text-xs text-gray-400">
          Mid target: ${holding.priceTargetMid.toFixed(2)}
        </div>
      </div>

      {holding.keyRisks.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-1">Risks:</p>
          <ul className="text-xs text-gray-600 space-y-0.5">
            {holding.keyRisks.map((risk, i) => (
              <li key={i} className="flex gap-1">
                <span className="text-amber-500">!</span> {risk}
              </li>
            ))}
          </ul>
        </div>
      )}

      {holding.sources.length > 0 && (
        <div>
          <button
            onClick={() => setShowSources(!showSources)}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            {showSources ? "Hide sources" : `Show sources (${holding.sources.length})`}
          </button>
          {showSources && (
            <ul className="mt-1 text-xs text-gray-500 space-y-0.5">
              {holding.sources.map((s, i) => (
                <li key={i}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 underline"
                  >
                    {s.title}
                  </a>
                  <span className="text-gray-400 ml-1">({s.source})</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
