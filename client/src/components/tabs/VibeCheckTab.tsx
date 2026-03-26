import { useState, useRef, useEffect } from "react";
import { useBriefing } from "../../hooks/useBriefing";
import { useChat } from "../../hooks/useChat";
import { useSavr } from "../../hooks/useSavr";
import type { BriefingResult, HoldingAnalysis, FundData } from "../../types";
import { api } from "../../api/client";
import aiLogo from "../../assets/Gemini_Generated_Image_946rnt946rnt946r.png";

const sentimentEmoji = { bullish: "\u{1F7E2}", bearish: "\u{1F534}", neutral: "\u{1F7E1}" };
const sentimentLabel = { bullish: "Positiv", bearish: "Negativ", neutral: "Neutral" };

function BriefingView({ briefing }: { briefing: BriefingResult }) {
  const [expandedTicker, setExpandedTicker] = useState<string | null>(null);

  return (
    <div className="space-y-4 pb-4">
      <div className="bg-accent/10 border border-accent/20 rounded-2xl p-4">
        <p className="text-xs text-accent-light uppercase tracking-wider font-medium mb-2">Daglig sammanfattning</p>
        <p className="text-sm text-gray-200 leading-relaxed">{briefing.marketSummary}</p>
      </div>

      {briefing.holdings.map((h) => (
        <HoldingCard
          key={h.ticker}
          holding={h}
          expanded={expandedTicker === h.ticker}
          onToggle={() => setExpandedTicker(expandedTicker === h.ticker ? null : h.ticker)}
        />
      ))}

      {briefing.overallRiskFactors.length > 0 && (
        <div className="bg-loss/10 border border-loss/20 rounded-2xl p-4">
          <p className="text-xs text-loss uppercase tracking-wider font-medium mb-2">Riskfaktorer</p>
          <ul className="space-y-1.5">
            {briefing.overallRiskFactors.map((r, i) => (
              <li key={i} className="text-sm text-gray-300 flex gap-2">
                <span className="text-loss shrink-0">!</span>{r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {briefing.sources.filter(s => s.type === "news").length > 0 && (
        <div className="bg-dark-700 rounded-2xl p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-2">Källor</p>
          <ul className="space-y-1.5">
            {briefing.sources.filter(s => s.type === "news").map((s, i) => (
              <li key={i} className="text-xs">
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-accent-light hover:underline">
                  {s.title}
                </a>
                <span className="text-gray-500 ml-1">— {s.source}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-[10px] text-gray-600 text-center px-4">{briefing.disclaimer}</p>
    </div>
  );
}

function HoldingCard({ holding: h, expanded, onToggle }: { holding: HoldingAnalysis; expanded: boolean; onToggle: () => void }) {
  const range = h.priceTargetHigh - h.priceTargetLow;
  const pos = range > 0 ? ((h.currentPrice - h.priceTargetLow) / range) * 100 : 50;

  return (
    <div className="bg-dark-700 rounded-2xl p-4 space-y-3">
      <button onClick={onToggle} className="w-full text-left">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-base">{sentimentEmoji[h.sentiment]}</span>
            <span className="font-bold text-white">{h.ticker}</span>
            <span className="text-xs text-gray-500">{h.name}</span>
          </div>
          <div className="text-right">
            <span className="text-sm font-semibold text-white">${h.currentPrice.toFixed(2)}</span>
          </div>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
            h.sentiment === "bullish" ? "bg-gain/20 text-gain" :
            h.sentiment === "bearish" ? "bg-loss/20 text-loss" :
            "bg-yellow-500/20 text-yellow-400"
          }`}>
            {sentimentLabel[h.sentiment]}
          </span>
          <span className="text-xs text-gray-500">Tryck för detaljer</span>
        </div>
      </button>

      {expanded && (
        <div className="space-y-3 pt-1 border-t border-dark-500">
          <p className="text-sm text-gray-300 leading-relaxed">{h.sentimentReason}</p>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] text-gray-500">
              <span>${h.priceTargetLow.toFixed(0)}</span>
              <span>Mål: ${h.priceTargetMid.toFixed(0)}</span>
              <span>${h.priceTargetHigh.toFixed(0)}</span>
            </div>
            <div className="relative h-1.5 bg-dark-500 rounded-full">
              <div className="absolute h-1.5 bg-accent/50 rounded-full" style={{ width: `${Math.min(100, Math.max(0, pos))}%` }} />
              <div
                className="absolute w-3 h-3 bg-accent rounded-full -top-[3px] border-2 border-dark-700"
                style={{ left: `${Math.min(96, Math.max(2, pos))}%`, transform: "translateX(-50%)" }}
              />
            </div>
          </div>

          {h.keyRisks.length > 0 && (
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Risker</p>
              <ul className="space-y-1">
                {h.keyRisks.map((r, i) => (
                  <li key={i} className="text-xs text-gray-400 flex gap-1.5">
                    <span className="text-loss shrink-0">!</span>{r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {h.sources.filter(s => s.type === "news").length > 0 && (
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Källor</p>
              <ul className="space-y-0.5">
                {h.sources.filter(s => s.type === "news").map((s, i) => (
                  <li key={i}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-accent-light hover:underline">
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ChatView({ onAction }: { onAction?: (action: any) => void }) {
  const { messages, loading, sendMessage } = useChat(onAction);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    sendMessage(input.trim());
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-12 space-y-3">
            <img src={aiLogo} alt="AI" className="w-16 h-16 mx-auto rounded-full object-cover bg-dark-700" />
            <p className="text-sm text-gray-400">Ställ en fråga om din portfölj</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                "Hur ser min portfölj ut idag?",
                "Vilken aktie har störst risk?",
                "Skapa en bevakningslista med svenska teknikaktier",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-xs bg-dark-600 border border-dark-500 text-gray-300 px-3 py-1.5 rounded-full hover:border-accent/50 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
              msg.role === "user"
                ? "bg-accent text-white"
                : "bg-dark-600 text-gray-200"
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-dark-600 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-3 bg-dark-800 border-t border-dark-600">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Skriv ett meddelande..."
            className="flex-1 bg-dark-600 text-white text-sm px-4 py-2.5 rounded-full border border-dark-500 focus:border-accent/50 outline-none placeholder:text-gray-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="w-10 h-10 bg-accent rounded-full flex items-center justify-center shrink-0 disabled:opacity-40 transition-opacity"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function FundSearch({ funds, selectedFundId, onSelect }: { funds: FundData[]; selectedFundId: string; onSelect: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedFund = funds.find((f) => f.id === selectedFundId);

  const filtered = query.trim()
    ? funds.filter((f) => {
        const q = query.toLowerCase();
        return f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q);
      })
    : funds;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (id: string) => {
    onSelect(id);
    const fund = funds.find((f) => f.id === id);
    setQuery(fund?.name || "");
    setOpen(false);
  };

  const handleFocus = () => {
    setOpen(true);
    if (selectedFund) setQuery("");
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          value={open ? query : selectedFund?.name || query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={handleFocus}
          placeholder="Sök fond..."
          className="w-full bg-dark-600 text-white text-sm pl-10 pr-3 py-2.5 rounded-xl border border-dark-500 focus:border-accent/50 outline-none placeholder:text-gray-500"
        />
        {selectedFund && !open && (
          <button
            onClick={() => { onSelect(""); setQuery(""); inputRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {open && (
        <div className="w-full mt-1 bg-dark-600 border border-dark-500 rounded-xl overflow-hidden shadow-lg max-h-60 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-500">Inga fonder hittades</p>
          ) : (
            filtered.map((f) => (
              <button
                key={f.id}
                onClick={() => handleSelect(f.id)}
                className={`w-full text-left px-4 py-2.5 hover:bg-dark-500 transition-colors ${
                  f.id === selectedFundId ? "bg-accent/10" : ""
                }`}
              >
                <p className="text-sm text-white">{f.name}</p>
                <p className="text-[10px] text-gray-500">{f.category} — SAVR: {f.savrFee}%</p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function AvgifterView() {
  const { result, loading, error, analyze } = useSavr();
  const [funds, setFunds] = useState<FundData[]>([]);
  const [selectedFundId, setSelectedFundId] = useState("");
  const [feeSource, setFeeSource] = useState<"avanza" | "nordnet" | "custom">("avanza");
  const [customFee, setCustomFee] = useState("");
  const [balance, setBalance] = useState("500000");

  useEffect(() => {
    api.get<FundData[]>("/savr/funds").then(setFunds).catch(() => {});
  }, []);

  const selectedFund = funds.find((f) => f.id === selectedFundId);

  const currentFee = (() => {
    if (!selectedFund) return 0;
    if (feeSource === "avanza") return selectedFund.avanzaFee;
    if (feeSource === "nordnet") return selectedFund.nordnetFee;
    return parseFloat(customFee) || 0;
  })();

  const handleAnalyze = () => {
    if (!selectedFund || currentFee <= 0) return;
    analyze({
      fundName: selectedFund.name,
      currentFee,
      savrFee: selectedFund.savrFee,
      balance: parseFloat(balance) || 0,
    });
  };

  const discount = selectedFund ? Math.round((1 - selectedFund.savrFee / currentFee) * 100) : 0;

  const vibeColor = (score: number) => score <= 3 ? "text-gain" : score <= 6 ? "text-yellow-400" : "text-loss";
  const vibeLabel = (score: number) => score <= 3 ? "Bra avgift" : score <= 6 ? "Se upp" : "Hög avgift!";
  const fmt = (n: number) => n.toLocaleString("sv-SE");

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
      {/* Fund selector */}
      <div className="bg-dark-700 rounded-2xl p-4 space-y-3">
        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Välj fond</p>
        <FundSearch funds={funds} selectedFundId={selectedFundId} onSelect={setSelectedFundId} />

        {selectedFund && (
          <div className="bg-dark-600 rounded-xl p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">SAVR-avgift</span>
              <span className="text-sm font-bold text-gain">{selectedFund.savrFee}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Avanza</span>
              <span className="text-sm text-gray-300">{selectedFund.avanzaFee}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Nordnet</span>
              <span className="text-sm text-gray-300">{selectedFund.nordnetFee}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Fee source selector */}
      {selectedFund && (
        <div className="bg-dark-700 rounded-2xl p-4 space-y-3">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Jämför med</p>
          <div className="flex gap-2">
            {([["avanza", "Avanza"], ["nordnet", "Nordnet"], ["custom", "Egen"]] as const).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setFeeSource(id)}
                className={`flex-1 py-2 text-sm font-medium rounded-xl transition-colors ${
                  feeSource === id ? "bg-accent text-white" : "bg-dark-600 text-gray-400 border border-dark-500"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {feeSource === "custom" && (
            <div>
              <label className="text-[10px] text-gray-500 uppercase">Din avgift (%)</label>
              <input
                type="number"
                step="0.01"
                placeholder="t.ex. 1.50"
                value={customFee}
                onChange={(e) => setCustomFee(e.target.value)}
                className="w-full bg-dark-600 text-white text-sm px-3 py-2 rounded-xl border border-dark-500 focus:border-accent/50 outline-none mt-0.5"
              />
            </div>
          )}

          {currentFee > 0 && (
            <div className="flex items-center justify-between bg-gain/10 rounded-xl px-3 py-2">
              <span className="text-xs text-gain">SAVR-rabatt</span>
              <span className="text-sm font-bold text-gain">-{discount}%</span>
            </div>
          )}

          <div>
            <label className="text-[10px] text-gray-500 uppercase">Saldo (kr)</label>
            <input
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="w-full bg-dark-600 text-white text-sm px-3 py-2 rounded-xl border border-dark-500 focus:border-accent/50 outline-none mt-0.5"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || currentFee <= 0}
            className="w-full py-2.5 bg-accent text-white rounded-xl font-medium text-sm hover:bg-accent-light disabled:opacity-50 transition-colors"
          >
            {loading ? "Analyserar..." : "Analysera avgifter"}
          </button>
        </div>
      )}

      {loading && (
        <div className="text-center py-8 space-y-3">
          <div className="w-8 h-8 border-3 border-accent/30 border-t-accent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-500">SAVR Fee Expert analyserar...</p>
        </div>
      )}

      {error && (
        <div className="bg-loss/10 border border-loss/20 rounded-2xl p-4 text-center">
          <p className="text-sm text-loss">{error}</p>
        </div>
      )}

      {result && !loading && (
        <>
          <div className="bg-dark-700 rounded-2xl p-4 text-center space-y-2">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Avgifts-vibe</p>
            <p className={`text-4xl font-bold ${vibeColor(result.risk_vibe)}`}>{result.risk_vibe}<span className="text-lg text-gray-500">/10</span></p>
            <p className={`text-sm font-medium ${vibeColor(result.risk_vibe)}`}>{vibeLabel(result.risk_vibe)}</p>
          </div>

          <div className="bg-accent/10 border border-accent/20 rounded-2xl p-4">
            <p className="text-xs text-accent-light uppercase tracking-wider font-medium mb-2">AI-analys</p>
            <p className="text-sm text-gray-200 leading-relaxed">{result.summary_text}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gain/10 border border-gain/20 rounded-2xl p-4 text-center">
              <p className="text-[10px] text-gain/70 uppercase tracking-wider">Besparing 10 år</p>
              <p className="text-xl font-bold text-gain mt-1">{fmt(result.savings_10y)} kr</p>
            </div>
            <div className="bg-gain/10 border border-gain/20 rounded-2xl p-4 text-center">
              <p className="text-[10px] text-gain/70 uppercase tracking-wider">Besparing 20 år</p>
              <p className="text-xl font-bold text-gain mt-1">{fmt(result.savings_20y)} kr</p>
            </div>
          </div>

          <div className="bg-dark-700 rounded-2xl p-4 space-y-3">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Detaljerad jämförelse</p>
            <p className="text-[10px] text-gray-500">Antar {result.details.annual_return}% årlig avkastning, saldo: {fmt(result.details.balance)} kr</p>
            <div className="space-y-2">
              <div>
                <p className="text-[10px] text-gray-500 uppercase mb-1">efter 10 år</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Med {feeSource === "custom" ? "din" : feeSource === "avanza" ? "Avanza" : "Nordnet"}-avgift</span>
                  <span className="text-white">{fmt(result.details.current_fee_cost_10y)} kr</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Med SAVR-avgift</span>
                  <span className="text-gain">{fmt(result.details.savr_fee_cost_10y)} kr</span>
                </div>
              </div>
              <div className="border-t border-dark-500 pt-2">
                <p className="text-[10px] text-gray-500 uppercase mb-1">efter 20 år</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Med {feeSource === "custom" ? "din" : feeSource === "avanza" ? "Avanza" : "Nordnet"}-avgift</span>
                  <span className="text-white">{fmt(result.details.current_fee_cost_20y)} kr</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Med SAVR-avgift</span>
                  <span className="text-gain">{fmt(result.details.savr_fee_cost_20y)} kr</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-gray-600 text-center">
            Beräkning baserad på ränta-på-ränta: A = P(1+r)^n. Ej finansiell rådgivning.
          </p>
        </>
      )}

      {!selectedFund && !result && (
        <div className="text-center py-8">
          <img src={aiLogo} alt="AI" className="w-16 h-16 mx-auto rounded-full object-cover mb-2" />
          <p className="text-sm text-gray-400">Välj en fond ovan för att jämföra avgifter mellan SAVR, Avanza och Nordnet.</p>
        </div>
      )}
    </div>
  );
}

export function VibeCheckTab({ onChatAction }: { onChatAction?: (action: any) => void }) {
  const { briefing, loading, error, generateBriefing } = useBriefing();
  const [mode, setMode] = useState<"briefing" | "chat" | "avgifter">("chat");

  return (
    <div className="flex flex-col h-full">
      {/* Sub-tab toggle */}
      <div className="px-4 pt-2 pb-3">
        <div className="flex bg-dark-700 rounded-xl p-1">
          {([["briefing", "Analys"], ["chat", "Chatt"], ["avgifter", "Avgifter"]] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                mode === id ? "bg-accent text-white" : "text-gray-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {mode === "briefing" && (
        <div className="flex-1 overflow-y-auto px-4">
          {!briefing && !loading && !error && (
            <div className="text-center py-16 space-y-4">
              <img src={aiLogo} alt="AI" className="w-20 h-20 mx-auto rounded-full object-cover bg-dark-700" />
              <div>
                <p className="text-lg font-semibold text-white">VibeCheck</p>
                <p className="text-sm text-gray-400 mt-1">AI-analys av din portfölj baserad på aktuell marknadsdata</p>
              </div>
              <button
                onClick={generateBriefing}
                className="px-6 py-3 bg-accent text-white rounded-full font-medium text-sm hover:bg-accent-light transition-colors"
              >
                Generera analys
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-16 space-y-4">
              <div className="w-10 h-10 border-3 border-accent/30 border-t-accent rounded-full animate-spin mx-auto" />
              <div>
                <p className="text-sm text-gray-300">Hämtar marknadsdata och analyserar...</p>
                <p className="text-xs text-gray-500 mt-1">Detta kan ta 15-30 sekunder</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-loss/10 border border-loss/20 rounded-2xl p-4 text-center space-y-2">
              <p className="text-sm text-loss">{error}</p>
              <button onClick={generateBriefing} className="text-xs text-accent-light underline">
                Försök igen
              </button>
            </div>
          )}

          {briefing && !loading && (
            <>
              <BriefingView briefing={briefing} />
              <div className="py-3 text-center">
                <button
                  onClick={generateBriefing}
                  className="text-xs text-accent-light underline"
                >
                  Uppdatera analys
                </button>
              </div>
            </>
          )}
        </div>
      )}
      {mode === "chat" && <ChatView onAction={onChatAction} />}
      {mode === "avgifter" && <AvgifterView />}
    </div>
  );
}
