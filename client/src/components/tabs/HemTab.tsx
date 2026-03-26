export function HemTab() {
  const now = new Date();
  const greeting = now.getHours() < 12 ? "God morgon" : now.getHours() < 18 ? "God eftermiddag" : "God kväll";

  return (
    <div className="px-4 pt-2 pb-4 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">{greeting}!</h1>
        <p className="text-sm text-gray-400 mt-1">Onsdag 26 mars 2026</p>
      </div>

      <div className="bg-dark-700 rounded-2xl p-4 space-y-3">
        <p className="text-xs text-gray-400 uppercase tracking-wider">Portföljvärde</p>
        <p className="text-3xl font-bold text-white">1 342 850 kr</p>
        <div className="flex items-center gap-2">
          <span className="text-gain text-sm font-medium">+21 340 kr (+1.67%)</span>
          <span className="text-xs text-gray-500">idag</span>
        </div>
      </div>

      <div className="bg-dark-700 rounded-2xl p-4 space-y-3">
        <p className="text-xs text-gray-400 uppercase tracking-wider">Marknadsöversikt</p>
        <div className="space-y-2">
          {[
            { name: "S&P 500", value: "5 892.40", change: "+0.83%" },
            { name: "NASDAQ", value: "18 432.10", change: "+1.12%" },
            { name: "OMXS30", value: "2 456.78", change: "-0.24%" },
          ].map((idx) => (
            <div key={idx.name} className="flex justify-between items-center">
              <span className="text-sm text-gray-300">{idx.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-white">{idx.value}</span>
                <span className={`text-xs font-medium ${idx.change.startsWith("+") ? "text-gain" : "text-loss"}`}>
                  {idx.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-dark-700 rounded-2xl p-4 space-y-3">
        <p className="text-xs text-gray-400 uppercase tracking-wider">Senaste nyheterna</p>
        <div className="space-y-3">
          {[
            { title: "NVIDIA överträffar förväntningar i Q1-rapport", time: "2 tim sedan" },
            { title: "Fed signalerar paus i räntehöjningar", time: "4 tim sedan" },
            { title: "Apple lanserar ny AI-tjänst", time: "6 tim sedan" },
          ].map((news, i) => (
            <div key={i} className="flex justify-between items-start gap-3">
              <p className="text-sm text-gray-300 leading-snug">{news.title}</p>
              <span className="text-[10px] text-gray-500 whitespace-nowrap shrink-0">{news.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
