import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { tripConfig } from "@/config/trip";
import type { CrowdLevel, Place, POI, Stay } from "@/config/types";
import NavButton from "./NavButton";
import { useOnline } from "@/hooks/useOnline";

/* ── Types & Constants ── */

type MapMarker = { kind: "poi"; data: POI } | { kind: "stay"; data: Stay };

type TypeFilter = "all" | "poi" | "stay";
type AreaFilter = "all" | string;
type ViewMode = "map" | "list";

const STAY_EMOJI = "🏡";

const typeFilters: { key: TypeFilter; emoji: string; label: string }[] = [
  { key: "all", emoji: "📍", label: "전체" },
  { key: "poi", emoji: "🧭", label: "가볼 곳" },
  { key: "stay", emoji: STAY_EMOJI, label: "숙소" },
];

const CROWD_LABEL: Record<CrowdLevel, string> = { low: "여유", mid: "보통", high: "혼잡" };
const CROWD_CLASS: Record<CrowdLevel, string> = {
  low: "bg-success/15 text-success",
  mid: "bg-sand/25 text-sand-deep",
  high: "bg-destructive/10 text-destructive",
};

/* ── Data from config ── */

const pois = tripConfig.pois;
const stays = tripConfig.stays;
const placeCategories = tripConfig.placeCategories;

const allMarkers: MapMarker[] = [
  ...pois.map((data): MapMarker => ({ kind: "poi", data })),
  ...stays.map((data): MapMarker => ({ kind: "stay", data })),
];

function markerName(m: MapMarker): string {
  return m.data.name;
}

function markerArea(m: MapMarker): string {
  return m.data.area;
}

function markerPlace(m: MapMarker): Place {
  return m.data.place;
}

/** 폴백 검색어용 주소. POI·숙소 모두 address 를 갖고 있다. */
function markerAddress(m: MapMarker): string | undefined {
  return m.data.address;
}

function markerEmoji(m: MapMarker): string {
  return m.kind === "poi" ? m.data.emoji : STAY_EMOJI;
}

function markerSubtitle(m: MapMarker): string {
  return m.kind === "poi" ? m.data.description : m.data.address;
}

/* ── Leaflet helpers ── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** 숙소는 사각형 · 소나무색 테두리, POI 는 원형 · 프라이머리색 테두리로 시각적으로 구분한다. */
function createMarkerIcon(m: MapMarker) {
  const safeName = escapeHtml(markerName(m));
  const isStay = m.kind === "stay";
  const borderColor = isStay ? "hsl(var(--pine))" : "hsl(var(--primary))";
  const radius = isStay ? "14px" : "50%";
  return L.divIcon({
    html: `<div style="font-size:22px;text-align:center;line-height:44px;width:44px;height:44px;background:hsl(var(--card));border-radius:${radius};box-shadow:0 2px 8px rgba(0,0,0,0.25);border:2.5px solid ${borderColor};" title="${safeName}" aria-label="${safeName}">${escapeHtml(markerEmoji(m))}</div>`,
    className: "emoji-marker",
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22],
  });
}

function FlyToPlace({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => { map.flyTo([lat, lng], 15, { duration: 0.8 }); }, [lat, lng, map]);
  return null;
}

function FitBounds({ places }: { places: Place[] }) {
  const map = useMap();
  useEffect(() => {
    if (places.length === 0) return;
    const bounds = L.latLngBounds(places.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [30, 30] });
  }, [map, places]);
  return null;
}

/* ── Component ── */

const MapTab = () => {
  const isOnline = useOnline();
  const [selected, setSelected] = useState<MapMarker | null>(null);
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number } | null>(null);
  const [activeType, setActiveType] = useState<TypeFilter>("all");
  const [activeArea, setActiveArea] = useState<AreaFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>(isOnline ? "map" : "list");

  // 오프라인 폴백: 통신이 끊기면 회색 빈 지도 대신 리스트 뷰로 강제 전환한다.
  useEffect(() => {
    if (!isOnline) setViewMode("list");
  }, [isOnline]);

  const filteredMarkers = useMemo(
    () =>
      allMarkers.filter((m) => {
        const matchType = activeType === "all" || m.kind === activeType;
        const matchArea = activeArea === "all" || markerArea(m) === activeArea;
        return matchType && matchArea;
      }),
    [activeType, activeArea]
  );

  const filteredCategories = useMemo(
    () => (activeArea === "all" ? placeCategories : placeCategories.filter((c) => c.area === activeArea)),
    [activeArea]
  );

  const clearFilters = () => {
    setActiveType("all");
    setActiveArea("all");
    setFlyTo(null);
    setSelected(null);
  };

  const hasActiveFilters = activeType !== "all" || activeArea !== "all";

  const selectMarker = (m: MapMarker) => {
    setSelected(m);
    setFlyTo({ lat: markerPlace(m).lat, lng: markerPlace(m).lng });
  };

  const closeSheet = () => {
    setSelected(null);
    setFlyTo(null);
  };

  return (
    <div className="space-y-4 fade-in">

      {/* ── View Toggle (지도/목록) ── */}
      <div className="bg-secondary/60 rounded-2xl p-1 flex gap-1">
        {(["map", "list"] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.97] ${
              viewMode === mode ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            <span className="text-base">{mode === "map" ? "🗺️" : "📋"}</span>
            <span>{mode === "map" ? "지도" : "목록"}</span>
          </button>
        ))}
      </div>

      {!isOnline && (
        <p className="text-xs text-muted-foreground bg-pine/10 border border-pine/20 rounded-xl px-3 py-2">
          📶 오프라인 상태예요. 지도 타일이 보이지 않을 수 있어 목록으로 보여드려요.
        </p>
      )}

      {/* ── Area Toggle ── */}
      <div className="bg-secondary/60 rounded-2xl p-1 flex gap-1">
        {(["all", ...tripConfig.areas] as AreaFilter[]).map((key) => {
          const isActive = activeArea === key;
          const emoji = key === "all" ? "🗺️" : "📍";
          const label = key === "all" ? "전체" : key;
          const count = key === "all" ? allMarkers.length : allMarkers.filter((m) => markerArea(m) === key).length;
          return (
            <button
              key={key}
              onClick={() => { setActiveArea(key); setFlyTo(null); setSelected(null); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.97] ${
                isActive ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              <span className="text-base">{emoji}</span>
              <span>{label}</span>
              <span className="text-xs opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {/* ── Type Chips (가볼 곳 / 숙소) ── */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-0.5">
        {typeFilters.map((f) => {
          const count = allMarkers.filter(
            (m) => (f.key === "all" || m.kind === f.key) && (activeArea === "all" || markerArea(m) === activeArea)
          ).length;
          if (count === 0 && f.key !== "all") return null;
          const isActive = activeType === f.key;
          return (
            <button
              key={f.key}
              onClick={() => { setActiveType(f.key); setFlyTo(null); setSelected(null); }}
              className={`flex items-center gap-1 px-3.5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all active:scale-95 ${
                isActive ? "bg-primary text-primary-foreground shadow-sm" : "bg-card border border-border text-foreground hover:bg-secondary"
              }`}
            >
              <span className="text-sm">{f.emoji}</span>
              <span>{f.label}</span>
              {f.key !== "all" && (
                <span className={`text-xs ml-0.5 ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Map ── */}
      {viewMode === "map" && (
        <div className="rounded-2xl overflow-hidden border border-border shadow-sm" style={{ height: "min(55vh, 400px)" }}>
          <MapContainer
            center={tripConfig.mapCenter}
            zoom={tripConfig.mapZoom}
            style={{ height: "100%", width: "100%" }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {!flyTo && <FitBounds places={filteredMarkers.map(markerPlace)} />}
            {flyTo && <FlyToPlace lat={flyTo.lat} lng={flyTo.lng} />}
            {filteredMarkers.map((m, i) => (
              <Marker
                key={`${markerName(m)}-${i}`}
                position={[markerPlace(m).lat, markerPlace(m).lng]}
                icon={createMarkerIcon(m)}
                eventHandlers={{ click: () => selectMarker(m) }}
              />
            ))}
          </MapContainer>
        </div>
      )}

      {/* ── Active filter badge ── */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {activeArea !== "all" && <span className="font-semibold text-foreground">{activeArea}</span>}
            {activeArea !== "all" && activeType !== "all" && " · "}
            {activeType !== "all" && (
              <span className="font-semibold text-foreground">{typeFilters.find((f) => f.key === activeType)?.label}</span>
            )}
            <span className="ml-1.5">{filteredMarkers.length}곳</span>
          </p>
          <button onClick={clearFilters} className="text-sm text-primary font-semibold active:opacity-70">
            필터 초기화
          </button>
        </div>
      )}

      {/* ── Place List ── */}
      {(viewMode === "list" || filteredMarkers.length === 0) && (
        <div className="space-y-2">
          {filteredMarkers.map((m, i) => (
            <button
              key={i}
              onClick={() => selectMarker(m)}
              className={`w-full card-base flex items-center gap-3 text-left active:scale-[0.98] transition-all ${
                selected && markerName(selected) === markerName(m) && selected.kind === m.kind ? "ring-2 ring-primary bg-primary/5" : ""
              }`}
            >
              <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                <span className="text-xl">{markerEmoji(m)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{markerName(m)}</p>
                <p className="text-sm text-muted-foreground truncate">{markerSubtitle(m)}</p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full flex-shrink-0 font-medium ${
                  tripConfig.areaBadgeColors[markerArea(m)]
                    ? `${tripConfig.areaBadgeColors[markerArea(m)].bg} ${tripConfig.areaBadgeColors[markerArea(m)].text}`
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {markerArea(m)}
              </span>
            </button>
          ))}
        </div>
      )}

      {filteredMarkers.length === 0 && (
        <div className="text-center py-8">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-sm text-muted-foreground">해당 조건의 장소가 없습니다</p>
          <button onClick={clearFilters} className="mt-3 text-sm text-primary font-bold">전체 보기</button>
        </div>
      )}

      {/* ── Tip Categories ── */}
      {filteredCategories.length > 0 && (
        <div className="space-y-4 pt-2">
          {filteredCategories.map((cat, ci) => (
            <div key={ci}>
              <h3 className="text-base font-bold text-foreground mb-2.5">{cat.emoji} {cat.title}</h3>
              <div className="space-y-1.5">
                {cat.items.map((item, pi) => (
                  <div key={pi} className="flex items-start gap-3 bg-secondary/40 rounded-xl px-4 py-3">
                    <span className="text-base mt-0.5">{cat.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.tip}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Bottom Sheet (portal to body to avoid parent transform breaking fixed positioning) ── */}
      {selected && createPortal(
        <div
          className="fixed inset-0 bg-black/40 z-[9999] flex items-end"
          role="dialog"
          aria-modal="true"
          onClick={closeSheet}
          onKeyDown={(e) => { if (e.key === "Escape") closeSheet(); }}
        >
          <div
            className="bg-card w-full rounded-t-3xl p-5 max-h-[70vh] overflow-y-auto"
            aria-label="장소 상세 정보"
            style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom, 0px))" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <span className="text-3xl">{markerEmoji(selected)}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground">{markerName(selected)}</h3>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                    {selected.kind === "poi" ? selected.data.category : "숙소"}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      tripConfig.areaBadgeColors[markerArea(selected)]
                        ? `${tripConfig.areaBadgeColors[markerArea(selected)].bg} ${tripConfig.areaBadgeColors[markerArea(selected)].text}`
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {markerArea(selected)}
                  </span>
                  {selected.kind === "poi" && selected.data.verification === "needs-check" && (
                    <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">확인 필요</span>
                  )}
                  {selected.kind === "poi" && selected.data.crowdLevel && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CROWD_CLASS[selected.data.crowdLevel]}`}>
                      혼잡도 {CROWD_LABEL[selected.data.crowdLevel]}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Info rows */}
            <div className="space-y-2 text-sm">
              {selected.kind === "poi" ? (
                <>
                  {[
                    { label: "📝 설명", value: selected.data.description },
                    { label: "📍 주소", value: selected.data.address },
                    { label: "⏱ 소요", value: selected.data.visitTime },
                    { label: "🕐 운영", value: selected.data.openHours },
                    { label: "🎟 입장료", value: selected.data.admission },
                  ]
                    .filter((row) => row.value)
                    .map((row, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="text-muted-foreground w-16 shrink-0">{row.label}</span>
                        <span className="text-foreground">{row.value}</span>
                      </div>
                    ))}

                  {selected.data.parking && (
                    <div className="flex gap-2">
                      <span className="text-muted-foreground w-16 shrink-0">🅿️ 주차</span>
                      <span className="text-foreground">
                        {selected.data.parking.available ? "가능" : "불가"}
                        {selected.data.parking.fee ? ` · ${selected.data.parking.fee}` : ""}
                        {selected.data.parking.note ? ` · ${selected.data.parking.note}` : ""}
                      </span>
                    </div>
                  )}

                  {selected.data.companionNote && (
                    <div className="bg-primary/5 border border-primary/10 rounded-xl p-3.5 mt-2">
                      <p className="text-xs text-primary font-bold mb-1">💬 동행자 배려 메모</p>
                      <p className="text-sm text-foreground leading-relaxed">{selected.data.companionNote}</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {[
                    { label: "📍 주소", value: selected.data.address },
                    { label: "🛏 숙박", value: selected.data.nights },
                    { label: "🕐 체크인", value: selected.data.checkIn },
                    { label: "🕐 체크아웃", value: selected.data.checkOut },
                    { label: "📞 연락처", value: selected.data.phone },
                  ]
                    .filter((row) => row.value)
                    .map((row, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="text-muted-foreground w-16 shrink-0">{row.label}</span>
                        <span className="text-foreground">{row.value}</span>
                      </div>
                    ))}

                  {selected.data.accessNote && (
                    <div className="bg-primary/5 border border-primary/10 rounded-xl p-3.5 mt-2">
                      <p className="text-xs text-primary font-bold mb-1">🚗 진입로 안내</p>
                      <p className="text-sm text-foreground leading-relaxed">{selected.data.accessNote}</p>
                    </div>
                  )}
                </>
              )}

              {/* Actions */}
              <div className="pt-1">
                <NavButton
                  place={markerPlace(selected)}
                  name={markerName(selected)}
                  address={markerAddress(selected)}
                  variant="full"
                />
              </div>
              <button
                onClick={closeSheet}
                className="w-full min-h-[48px] bg-secondary text-secondary-foreground rounded-xl font-bold active:opacity-80 transition-opacity mt-2"
              >
                닫기
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default MapTab;
