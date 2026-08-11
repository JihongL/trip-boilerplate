import React, { useState, Suspense } from "react";
import BottomNav from "@/components/trip/BottomNav";
import TodayTab from "@/components/trip/TodayTab";
const MapTab = React.lazy(() => import("@/components/trip/MapTab"));
import FoodTab from "@/components/trip/FoodTab";
/**
 * ExchangeTab 은 해외여행 전용이라 반드시 lazy 여야 한다.
 * 정적 import 하면 exchange 가 없는 국내여행 config 에서도 모듈이 평가되어
 * 앱 전체가 로드 시점에 죽는다 (교차검증에서 재현된 실제 사고).
 */
const ExchangeTab = React.lazy(() => import("@/components/trip/ExchangeTab"));
import SosTab from "@/components/trip/SosTab";
import OfflineBanner from "@/components/trip/OfflineBanner";
import PwaInstallBanner from "@/components/trip/PwaInstallBanner";
import { tripConfig } from "@/config/trip";
import type { TabId } from "@/config/types";

const TripDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabId>(tripConfig.tabs[0]?.id ?? "today");

  const activeTabConfig = tripConfig.tabs.find((tab) => tab.id === activeTab);

  const renderTab = () => {
    switch (activeTab) {
      case "today":
        return <TodayTab />;
      case "map":
        return (
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-20">
                <p className="text-muted-foreground">지도 로딩중...</p>
              </div>
            }
          >
            <MapTab />
          </Suspense>
        );
      case "food":
        return <FoodTab />;
      case "sos":
        return <SosTab />;
      case "exchange":
        return (
          <Suspense fallback={null}>
            <ExchangeTab />
          </Suspense>
        );
      default:
        // config 에 없는(매핑되지 않은) 탭 id 는 아무것도 렌더하지 않는다
        return null;
    }
  };

  // 사진 자산이 있으면 이미지 헤더, 없으면 gradient 헤더 (+ 능선 실루엣)
  const { headerImage, headerGradient } = tripConfig.meta;
  const useImageHeader = !!headerImage;

  const headerStyle: React.CSSProperties = useImageHeader
    ? {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url('${headerImage}')`,
        backgroundPositionY: "20%",
      }
    : headerGradient
      ? { background: headerGradient }
      : {};

  const headerClassName = useImageHeader
    ? "bg-cover bg-center bg-no-repeat"
    : headerGradient
      ? ""
      : "header-gradient";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
      <header
        className={`sticky top-0 z-40 overflow-hidden border-b border-border/50 px-4 py-3 text-white shadow-md relative ${headerClassName}`}
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
          ...headerStyle,
        }}
      >
        {!useImageHeader && (
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-10 w-full"
            viewBox="0 0 400 60"
            preserveAspectRatio="none"
          >
            <path
              d="M0,60 L0,35 L40,20 L80,32 L120,15 L160,28 L200,10 L240,25 L280,18 L320,30 L360,12 L400,26 L400,60 Z"
              className="fill-black/15"
            />
            <path
              d="M0,60 L0,45 L50,30 L90,42 L130,25 L170,38 L210,20 L250,35 L290,28 L330,40 L370,22 L400,36 L400,60 Z"
              className="fill-black/25"
            />
          </svg>
        )}
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3 relative z-10">
          <div>
            <p className="text-xs font-bold tracking-wide text-white/80">{tripConfig.headerLabel}</p>
            <h1 className="text-lg font-bold text-white drop-shadow-sm">{activeTabConfig?.label}</h1>
          </div>
        </div>
      </header>

      <OfflineBanner />

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
