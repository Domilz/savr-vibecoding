import type { SourceReference } from "../../types";

interface Props {
  sources: SourceReference[];
}

export function SourceList({ sources }: Props) {
  if (sources.length === 0) return null;

  const grouped = {
    news: sources.filter((s) => s.type === "news"),
    data: sources.filter((s) => s.type === "data"),
    fundamental: sources.filter((s) => s.type === "fundamental"),
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">All Sources</h3>

      {grouped.news.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-500 uppercase mb-1">News Articles</p>
          <ul className="space-y-0.5">
            {grouped.news.map((s, i) => (
              <li key={i} className="text-xs">
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                  {s.title}
                </a>
                <span className="text-gray-400 ml-1">— {s.source}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {grouped.fundamental.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-500 uppercase mb-1">Fundamental Data</p>
          <ul className="space-y-0.5">
            {grouped.fundamental.map((s, i) => (
              <li key={i} className="text-xs text-gray-600">
                {s.title} <span className="text-gray-400">— {s.source}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {grouped.data.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase mb-1">Market Data</p>
          <ul className="space-y-0.5">
            {grouped.data.map((s, i) => (
              <li key={i} className="text-xs text-gray-600">
                {s.title} <span className="text-gray-400">— {s.source}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
