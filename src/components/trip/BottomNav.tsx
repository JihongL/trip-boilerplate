
export type TabId = "today" | "map" | "exchange" | "sos";

interface Tab {
  id: TabId;
  label: string;
  emoji: string;
}

const tabs: Tab[] = [
  { id: "today", label: "오늘", emoji: "📋" },
  { id: "map", label: "지도", emoji: "🗺️" },
  { id: "exchange", label: "환율", emoji: "💱" },
  { id: "sos", label: "SOS", emoji: "🚨" },
];

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => (
  <nav
    className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] pt-2"
    aria-label="하단 메뉴"
  >
    <div className="mx-auto max-w-lg rounded-3xl border border-border/70 bg-card/95 shadow-lg backdrop-blur-md">
      <div className="grid grid-cols-4 px-2 py-1.5" role="tablist">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isSos = tab.id === "sos";

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              role="tab"
              aria-selected={isActive}
              aria-label={tab.label}
              className={`flex flex-col items-center justify-center rounded-2xl py-3 transition-all active:scale-95 ${
                isActive
                  ? isSos
                    ? "bg-red-500 text-white"
                    : "bg-primary text-primary-foreground"
                  : isSos
                    ? "text-red-500"
                    : "text-muted-foreground"
              }`}
            >
              <span className={`text-2xl leading-none ${isActive ? "scale-110" : ""}`}>
                {tab.emoji}
              </span>
              <span className={`mt-1 text-sm font-bold leading-none`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  </nav>
);

export default BottomNav;
