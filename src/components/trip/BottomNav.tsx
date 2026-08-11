import type { TabId } from "@/config/types";
import { tripConfig } from "@/config/trip";

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

/**
 * tripConfig.tabs 를 그대로 렌더한다 (2~5개 지원).
 * Tailwind JIT는 동적으로 조립한 `grid-cols-${n}` 클래스를 인식하지 못하므로
 * gridTemplateColumns 를 인라인 스타일로 직접 지정해 그리드가 깨지지 않게 한다.
 */
const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const tabs = tripConfig.tabs;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] pt-2"
      aria-label="하단 메뉴"
    >
      <div className="mx-auto max-w-lg rounded-3xl border border-border/70 bg-card/95 shadow-lg backdrop-blur-md">
        <div
          className="grid px-2 py-1.5"
          style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0,1fr))` }}
          role="tablist"
        >
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
                className={`flex min-h-[44px] flex-col items-center justify-center rounded-2xl py-3 transition-all active:scale-95 ${
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
                <span className="mt-1 text-sm font-bold leading-none">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
