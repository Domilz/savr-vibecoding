import type { BriefingResult } from "../../types";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { MarketSummary } from "./MarketSummary";
import { HoldingAnalysisCard } from "./HoldingAnalysis";
import { RiskFactors } from "./RiskFactors";
import { SourceList } from "./SourceList";

interface Props {
  briefing: BriefingResult | null;
  loading: boolean;
  error: string | null;
  onGenerate: () => void;
}

export function BriefingPanel({ briefing, loading, error, onGenerate }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Daily Briefing</h2>
        <button
          onClick={onGenerate}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Generating..." : "Generate Briefing"}
        </button>
      </div>

      {loading && (
        <LoadingSpinner message="Fetching market data and generating analysis... This may take 15-30 seconds." />
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
          <button
            onClick={onGenerate}
            className="mt-2 text-sm text-red-600 underline hover:text-red-800"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && !briefing && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-1">No briefing yet</p>
          <p className="text-sm">Click "Generate Briefing" to get your daily portfolio analysis.</p>
        </div>
      )}

      {briefing && !loading && (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">{briefing.disclaimer}</p>
          </div>

          <MarketSummary summary={briefing.marketSummary} />

          <div className="space-y-3">
            {briefing.holdings.map((h) => (
              <HoldingAnalysisCard key={h.ticker} holding={h} />
            ))}
          </div>

          <RiskFactors risks={briefing.overallRiskFactors} />
          <SourceList sources={briefing.sources} />

          <p className="text-xs text-gray-400 text-center">
            Generated at {new Date(briefing.generatedAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
