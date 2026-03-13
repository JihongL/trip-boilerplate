import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { tripConfig } from "@/config/trip";
import type { POI } from "@/config/types";

/* ── Types & Constants ── */

type FilterKey = "all" | "숙소" | "관광지" | "맛집" | "카페" | "해변" | "시장" | "액티비티" | "기타";
type AreaKey = "all" | string;

const categoryFilters: { key: FilterKey; emoji: string; label: string }[] = [
  { key: "all", emoji: "📍", label: "전체" },
  { key: "관광지", emoji: "🏛️", label: "관광" },
  { key: "맛집", emoji: "🍜", label: "맛집" },
  { key: "카페", emoji: "☕", label: "카페" },
  { key: "숙소", emoji: "🏨", label: "숙소" },
  { key: "해변", emoji: "🏖️", label: "해변" },
  { key: "시장", emoji: "🛍️", label: "시장" },
  { key: "액티비티", emoji: "🎯", label: "액티비티" },
];

function getFilterKey(category: string): FilterKey {
  if (category.startsWith("숙소")) return "숙소";
  for (const k of ["관광지", "맛집", "카페", "해변", "시장", "액티비티"] as FilterKey[]) {
    if (category === k) return k;
  }
  return "기타";
}

/* ── Data from config ── */

const places = tripConfig.pois;
const placeCategories = tripConfig.placeCategories;

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

function createEmojiIcon(emoji: string, name?: string) {
  const safeName = name ? escapeHtml(name) : "";
  const titleAttr = safeName ? ` title="${safeName}" aria-label="${safeName}"` : "";
  return L.divIcon({
    html: `<div style="font-size:22px;text-align:center;line-height:44px;width:44px;height:44px;background:white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.25);border:2.5px solid hsl(20,85%,55%);"${titleAttr}>${escapeHtml(emoji)}</div>`,
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

function FitBounds({ places: pts }: { places: POI[] }) {
  const map = useMap();
  useEffect(() => {
    if (pts.length === 0) return;
    const bounds = L.latLngBounds(pts.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [30, 30] });
  }, [map, pts]);
  return null;
}

/* ── Component ── */

const MapTab = () => {
  const [selected, setSelected] = useState<POI | null>(null);
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number } | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [activeArea, setActiveArea] = useState<AreaKey>("all");

  const filteredPlaces = useMemo(() =>
    places.filter((p) => {
      const matchCat = activeFilter === "all" || getFilterKey(p.category) === activeFilter;
      const matchArea = activeArea === "all" || p.area === activeArea;
      return matchCat && matchArea;
    }),
  [activeFilter, activeArea]);

  const filteredCategories = useMemo(() => {
    let cats = placeCategories;
    if (activeFilter !== "all") {
      const catMap: Record<string, string[]> = {
        "맛집": ["맛집"], "카페": ["카페"], "해변": ["해변"], "액티비티": ["액티비티"],
      };
      const keywords = catMap[activeFilter];
      if (keywords) cats = cats.filter((c) => keywords.some((k) => c.title.includes(k)));
      else cats = [];
    }
    if (activeArea !== "all") {
      cats = cats.filter((c) => c.area === activeArea || c.area === "all");
    }
    return cats;
  }, [activeFilter, activeArea]);

  const clearFilters = () => {
    setActiveFilter("all");
    setActiveArea("all");
    setFlyTo(null);
    setSelected(null);
  };

  const hasActiveFilters = activeFilter !== "all" || activeArea !== "all";

  return (
    <div className="space-y-4 fade-in">

      {/* ── Area Toggle ── */}
      <div className="bg-secondary/60 rounded-2xl p-1 flex gap-1">
        {(["all", ...tripConfig.areas] as AreaKey[]).map((key) => {
          const isActive = activeArea === key;
          const emoji = key === "all" ? "🗺️" : key === tripConfig.areas[0] ? "🏙️" : "🏮";
          const label = key === "all" ? "전체" : key;
          const count = key === "all" ? places.length : places.filter((p) => p.area === key).length;
          return (
            <button
              key={key}
              onClick={() => { setActiveArea(key); setFlyTo(null); setSelected(null); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.97] ${
                isActive
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              <span className="text-base">{emoji}</span>
              <span>{label}</span>
              <span className="text-xs opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {/* ── Category Chips ── */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-0.5">
        {categoryFilters.map((f) => {
          const count = places.filter((p) =>
            (f.key === "all" || getFilterKey(p.category) === f.key) &&
            (activeArea === "all" || p.area === activeArea)
          ).length;
          if (count === 0 && f.key !== "all") return null;
          const isActive = activeFilter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => { setActiveFilter(f.key); setFlyTo(null); setSelected(null); }}
              className={`flex items-center gap-1 px-3.5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all active:scale-95 ${
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "bg-card border border-border text-foreground hover:bg-secondary"
              }`}
            >
              <span className="text-sm">{f.emoji}</span>
              <span>{f.label}</span>
              {f.key !== "all" && (
                <span className={`text-xs ml-0.5 ${isActive ? "text-white/70" : "text-muted-foreground"}`}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Map ── */}
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
          {!flyTo && <FitBounds places={filteredPlaces} />}
          {flyTo && <FlyToPlace lat={flyTo.lat} lng={flyTo.lng} />}
          {filteredPlaces.map((place, i) => (
            <Marker
              key={`${place.name}-${i}`}
              position={[place.lat, place.lng]}
              icon={createEmojiIcon(place.emoji, place.name)}
              eventHandlers={{
                click: () => { setSelected(place); setFlyTo({ lat: place.lat, lng: place.lng }); },
              }}
            />
          ))}
        </MapContainer>
      </div>

      {/* ── Active filter badge ── */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {activeArea !== "all" && <span className="font-semibold text-foreground">{activeArea}</span>}
            {activeArea !== "all" && activeFilter !== "all" && " · "}
            {activeFilter !== "all" && <span className="font-semibold text-foreground">{categoryFilters.find((f) => f.key === activeFilter)?.label}</span>}
            <span className="ml-1.5">{filteredPlaces.length}곳</span>
          </p>
          <button onClick={clearFilters} className="text-sm text-primary font-semibold active:opacity-70">
            필터 초기화
          </button>
        </div>
      )}

      {/* ── Place List ── */}
      <div className="space-y-2">
        {filteredPlaces.map((place, i) => (
          <button
            key={i}
            onClick={() => { setSelected(place); setFlyTo({ lat: place.lat, lng: place.lng }); }}
            className={`w-full card-base flex items-center gap-3 text-left active:scale-[0.98] transition-all ${
              selected?.name === place.name ? "ring-2 ring-primary bg-primary/5" : ""
            }`}
          >
            <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
              <span className="text-xl">{place.emoji}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{place.name}</p>
              <p className="text-sm text-muted-foreground truncate">{place.description}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 font-medium ${
              tripConfig.areaBadgeColors[place.area]
                ? `${tripConfig.areaBadgeColors[place.area].bg} ${tripConfig.areaBadgeColors[place.area].text}`
                : "bg-gray-50 text-gray-700"
            }`}>
              {place.area}
            </span>
          </button>
        ))}
      </div>

      {filteredPlaces.length === 0 && (
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
          onClick={() => { setSelected(null); setFlyTo(null); }}
          onKeyDown={(e) => { if (e.key === "Escape") { setSelected(null); setFlyTo(null); } }}
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
                <span className="text-3xl">{selected.emoji}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground">{selected.name}</h3>
                <div className="flex gap-1.5 mt-1">
                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{selected.category}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    tripConfig.areaBadgeColors[selected.area]
                      ? `${tripConfig.areaBadgeColors[selected.area].bg} ${tripConfig.areaBadgeColors[selected.area].text}`
                      : "bg-gray-50 text-gray-700"
                  }`}>{selected.area}</span>
                </div>
              </div>
            </div>

            {/* Info rows */}
            <div className="space-y-2 text-sm">
              {[
                { label: "📝 설명", value: selected.description },
                { label: "📍 주소", value: selected.address },
                { label: "⏱ 소요", value: selected.visitTime },
                { label: "🚗 교통", value: selected.transport },
              ].map((row, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-muted-foreground w-16 shrink-0">{row.label}</span>
                  <span className="text-foreground">{row.value}</span>
                </div>
              ))}

              {/* Family tip */}
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-3.5 mt-2">
                <p className="text-xs text-primary font-bold mb-1">👨‍👩‍👧 여행 꿀팁</p>
                <p className="text-sm text-foreground leading-relaxed">{selected.familyNote}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <a
                  href={`https://maps.google.com/?q=${selected.lat},${selected.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center bg-secondary text-secondary-foreground min-h-[48px] flex items-center justify-center rounded-xl text-sm font-bold active:opacity-80 transition-opacity"
                >
                  🗺️ Google Maps
                </a>
                <button
                  onClick={() => { setSelected(null); setFlyTo(null); }}
                  className="flex-1 min-h-[48px] bg-primary text-primary-foreground rounded-xl font-bold active:opacity-80 transition-opacity"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default MapTab;
