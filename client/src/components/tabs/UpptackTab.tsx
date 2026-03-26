export function UpptackTab() {
  const categories = [
    { name: "Teknik", emoji: "\u{1F4BB}", count: 24 },
    { name: "Hälsovård", emoji: "\u{1F3E5}", count: 18 },
    { name: "Finans", emoji: "\u{1F3E6}", count: 31 },
    { name: "Energi", emoji: "\u26A1", count: 12 },
    { name: "Konsument", emoji: "\u{1F6D2}", count: 22 },
    { name: "Industri", emoji: "\u{1F3ED}", count: 15 },
  ];

  const trending = [
    { ticker: "PLTR", name: "Palantir Technologies", sector: "Teknik", change: "+8.42%" },
    { ticker: "SMCI", name: "Super Micro Computer", sector: "Teknik", change: "+5.67%" },
    { ticker: "COIN", name: "Coinbase Global", sector: "Finans", change: "+4.21%" },
  ];

  return (
    <div className="px-4 pt-2 pb-4 space-y-5">
      <h1 className="text-xl font-bold text-white">Upptäck</h1>

      <div>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            placeholder="Sök aktier, ETF:er..."
            className="w-full bg-dark-700 text-white text-sm pl-10 pr-4 py-3 rounded-xl border border-dark-500 focus:border-accent/50 outline-none placeholder:text-gray-500"
          />
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Kategorier</p>
        <div className="grid grid-cols-3 gap-2">
          {categories.map((cat) => (
            <button key={cat.name} className="bg-dark-700 rounded-xl p-3 text-center hover:bg-dark-600 transition-colors">
              <p className="text-xl">{cat.emoji}</p>
              <p className="text-xs text-white mt-1">{cat.name}</p>
              <p className="text-[10px] text-gray-500">{cat.count} bolag</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Trendande just nu</p>
        <div className="space-y-2">
          {trending.map((s) => (
            <div key={s.ticker} className="bg-dark-700 rounded-2xl p-4 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{s.ticker}</span>
                  <span className="text-[10px] bg-dark-500 text-gray-400 px-1.5 py-0.5 rounded">{s.sector}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{s.name}</p>
              </div>
              <span className="text-sm font-semibold text-gain">{s.change}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
