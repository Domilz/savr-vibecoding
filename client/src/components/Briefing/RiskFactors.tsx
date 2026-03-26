export function RiskFactors({ risks }: { risks: string[] }) {
  if (risks.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-amber-900 mb-2">Portfolio Risk Factors</h3>
      <ul className="space-y-1">
        {risks.map((risk, i) => (
          <li key={i} className="text-sm text-amber-800 flex gap-2">
            <span className="text-amber-500 shrink-0">!</span>
            {risk}
          </li>
        ))}
      </ul>
    </div>
  );
}
