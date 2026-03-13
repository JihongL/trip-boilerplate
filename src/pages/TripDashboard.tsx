import React, { useState, Suspense } from "react";
import BottomNav, { TabId } from "@/components/trip/BottomNav";
import TodayTab from "@/components/trip/TodayTab";
const MapTab = React.lazy(() => import("@/components/trip/MapTab"));
import ExchangeTab from "@/components/trip/ExchangeTab";
import SosTab from "@/components/trip/SosTab";
import PwaInstallBanner from "@/components/trip/PwaInstallBanner";
import { tripConfig } from "@/config/trip";

const TripDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabId>("today");

  const tabTitles: Record<TabId, string> = {
    today: "오늘",
    map: "지도",
    exchange: "환율",
    sos: "SOS",
  };

  const renderTab = () => {
    switch (activeTab) {
      case "today":
        return <TodayTab />;
      case "map":
        return (
          <Suspense fallback={<div className="flex items-center justify-center py-20"><p className="text-muted-foreground">지도 로딩중...</p></div>}>
            <MapTab />
          </Suspense>
        );
      case "exchange":
        return <ExchangeTab />;
      case "sos":
        return <SosTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
      <header
        className="sticky top-0 z-40 border-b border-border/50 px-4 py-3 bg-cover bg-center bg-no-repeat text-white shadow-md relative"
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url('${tripConfig.meta.headerImage}')`,
          backgroundPositionY: "20%"
        }}
      >
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3 relative z-10">
          <div>
            <p className="text-xs font-bold tracking-wide text-white/80">{tripConfig.headerLabel}</p>
            <h1 className="text-lg font-bold text-white drop-shadow-sm">{tabTitles[activeTab]}</h1>
          </div>
        </div>
      </header>

      <main className="bottom-nav-safe mx-auto max-w-lg px-4 py-5">
        {renderTab()}
        <p className="text-center text-[10px] text-muted-foreground/50 mt-8 mb-2">{tripConfig.footerText}</p>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      <PwaInstallBanner />
    </div>
  );
};

export default TripDashboard;
