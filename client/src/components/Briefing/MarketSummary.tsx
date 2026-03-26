export function MarketSummary({ summary }: { summary: string }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-blue-900 mb-1">Market Summary</h3>
      <p className="text-sm text-blue-800 leading-relaxed">{summary}</p>
    </div>
  );
}
