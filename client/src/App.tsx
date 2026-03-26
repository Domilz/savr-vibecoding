import { useState, useCallback } from "react";
import { TabBar } from "./components/TabBar";
import { HemTab } from "./components/tabs/HemTab";
import { InnehavTab } from "./components/tabs/InnehavTab";
import { VibeCheckTab } from "./components/tabs/VibeCheckTab";
import { BevakaTab } from "./components/tabs/BevakaTab";
import { UpptackTab } from "./components/tabs/UpptackTab";
import aiLogo from "./assets/Gemini_Generated_Image_946rnt946rnt946r.png";
import type { ChatAction } from "./types";

function App() {
  const [activeTab, setActiveTab] = useState("vibecheck");
  const [watchlistRefreshKey, setWatchlistRefreshKey] = useState(0);

  const handleChatAction = useCallback((action: ChatAction) => {
    if (action.type === "create_watchlist" || action.type === "add_to_watchlist") {
      setWatchlistRefreshKey((k) => k + 1);
    }
  }, []);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-dark-900 relative">
      {/* Status bar mock */}
      <div className="sticky top-0 z-40 bg-dark-900/80 backdrop-blur-xl border-b border-dark-700/50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {activeTab === "vibecheck" && (
            <img src={aiLogo} alt="AI" className="w-7 h-7 rounded-full object-cover bg-dark-700" />
          )}
          <span className="text-sm font-semibold text-white">
            {activeTab === "hem" && "Hem"}
            {activeTab === "innehav" && "Innehav"}
            {activeTab === "vibecheck" && "VibeCheck"}
            {activeTab === "bevaka" && "Bevaka"}
            {activeTab === "upptack" && "Upptäck"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-accent-light bg-accent/10 px-2 py-0.5 rounded-full">AI</span>
        </div>
      </div>

      {/* Content */}
      <div className="pb-20" style={{ minHeight: "calc(100vh - 52px)" }}>
        {activeTab === "hem" && <HemTab />}
        {activeTab === "innehav" && <InnehavTab />}
        {activeTab === "vibecheck" && <VibeCheckTab onChatAction={handleChatAction} />}
        {activeTab === "bevaka" && <BevakaTab refreshKey={watchlistRefreshKey} />}
        {activeTab === "upptack" && <UpptackTab />}
      </div>

      <TabBar active={activeTab} onSelect={setActiveTab} />
    </div>
  );
}

export default App;
