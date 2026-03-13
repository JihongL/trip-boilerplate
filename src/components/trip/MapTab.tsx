import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ── Types & Constants ── */

type FilterKey = "all" | "숙소" | "관광지" | "맛집" | "카페" | "해변" | "시장" | "액티비티" | "기타";
type AreaKey = "all" | "다낭" | "호이안";

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

/* ── Data ── */

interface MapPlace {
  emoji: string;
  name: string;
  category: string;
  area: "다낭" | "호이안";
  description: string;
  why: string;
  address: string;
  visitTime: string;
  transport: string;
  familyNote: string;
  lat: number;
  lng: number;
}

const places: MapPlace[] = [
  { emoji: "✈️", name: "다낭 국제공항 (DAD)", category: "공항", area: "다낭", description: "베트남 중부 주요 공항", why: "입출국 공항", address: "Da Nang International Airport", visitTime: "입출국 시", transport: "택시/Grab 이용", familyNote: "작은 공항이라 이동이 편해요", lat: 16.0556, lng: 108.1992 },
  { emoji: "🏨", name: "Little Oasis Hotel", category: "숙소 (3/20~22)", area: "호이안", description: "에코 프렌들리 호텔 & 스파", why: "호이안 숙소", address: "215 Lê Thánh Tông, Hội An", visitTime: "3/20~22", transport: "공항에서 택시 40분", familyNote: "올드타운 가까워 이동 편리", lat: 15.8794, lng: 108.3350 },
  { emoji: "🏨", name: "Novotel Danang Premier", category: "숙소 (3/22~23)", area: "다낭", description: "한강변 5성급 호텔", why: "다낭 숙소", address: "36 Bach Dang St, Đà Nẵng", visitTime: "3/22~23", transport: "공항에서 택시 10분", familyNote: "한강뷰, 수영장, 조식 뷔페 우수", lat: 16.0681, lng: 108.2240 },
  { emoji: "🏛️", name: "호이안 올드타운", category: "관광지", area: "호이안", description: "유네스코 세계문화유산", why: "호이안의 핵심 관광지", address: "Hoi An Ancient Town", visitTime: "2~3시간", transport: "호텔에서 도보 10분", familyNote: "평지라 걷기 편하고 야경이 아름다워요", lat: 15.8773, lng: 108.3280 },
  { emoji: "🌉", name: "일본교 (내원교)", category: "관광지", area: "호이안", description: "호이안 상징적 다리", why: "호이안 대표 랜드마크", address: "Japanese Covered Bridge, Hoi An", visitTime: "20분", transport: "올드타운 내 도보", familyNote: "사진 포인트! 낮과 밤 다른 분위기", lat: 15.8770, lng: 108.3262 },
  { emoji: "🚤", name: "코코넛 보트", category: "액티비티", area: "호이안", description: "대나무 바구니 보트 체험", why: "재미있는 수상 액티비티", address: "Cam Thanh, Hoi An", visitTime: "1~2시간", transport: "호텔에서 차로 15분", familyNote: "서여사 · 이서방도 즐길 수 있는 안전한 체험", lat: 15.8630, lng: 108.3410 },
  { emoji: "🏖️", name: "미케 비치", category: "해변", area: "다낭", description: "다낭 대표 해변", why: "해변 액티비티 & 휴식", address: "My Khe Beach, Da Nang", visitTime: "2~3시간", transport: "다낭 시내에서 가까움", familyNote: "깨끗하고 넓은 해변. 그늘 있는 곳에서 쉬기", lat: 16.0470, lng: 108.2500 },
  { emoji: "🎡", name: "바나힐", category: "관광지", area: "다낭", description: "골든 브릿지로 유명한 테마파크", why: "컨디션 따라 선택 관광", address: "Ba Na Hills, Da Nang", visitTime: "3~4시간", transport: "다낭에서 차로 40분", familyNote: "케이블카 탑승. 선선한 기후가 장점", lat: 15.9977, lng: 107.9875 },
  { emoji: "🛍️", name: "호이안 야시장", category: "시장", area: "호이안", description: "등불과 기념품의 야시장", why: "쇼핑 & 야경 & 소원보트", address: "Nguyen Hoang, Hoi An", visitTime: "1~2시간", transport: "올드타운 내 도보", familyNote: "흥정 가능. 소원보트 체험 추천!", lat: 15.8768, lng: 108.3274 },
  { emoji: "🌉", name: "용다리 (Dragon Bridge)", category: "관광지", area: "다낭", description: "불 뿜는 용 모양 다리", why: "다낭 상징 랜드마크", address: "Dragon Bridge, Da Nang", visitTime: "30분 (주말 밤 불쇼)", transport: "노보텔에서 도보 5분", familyNote: "주말 밤 9시 불쇼! 가까이서 보면 더 멋져요", lat: 16.0612, lng: 108.2278 },
  { emoji: "🛍️", name: "한시장 (Han Market)", category: "시장", area: "다낭", description: "다낭 대표 재래시장", why: "기념품 & 현지 물건 쇼핑", address: "119 Trần Phú, Da Nang", visitTime: "1~2시간", transport: "노보텔에서 도보 10분", familyNote: "흥정 필수! 오전이 덜 붐비고 좋아요", lat: 16.0680, lng: 108.2241 },
  { emoji: "🍜", name: "Phở Bà Vị", category: "맛집", area: "다낭", description: "다낭 현지인 쌀국수 맛집", why: "진한 육수의 로컬 맛집", address: "684 Ngô Quyền, Da Nang", visitTime: "30분", transport: "택시/Grab", familyNote: "현지인이 줄서는 집. 아침식사로 추천", lat: 16.0597, lng: 108.2107 },
  { emoji: "🍜", name: "Bún chả cá Bà Hường", category: "맛집", area: "다낭", description: "다낭식 어묵국수", why: "다낭 대표 로컬 음식", address: "100 Lê Đình Dương, Da Nang", visitTime: "30분", transport: "노보텔에서 도보 15분", familyNote: "다낭 와서 이걸 안 먹으면 섭섭!", lat: 16.0650, lng: 108.2200 },
  { emoji: "🍖", name: "Madame Lân", category: "맛집", area: "다낭", description: "베트남 정통 레스토랑", why: "깔끔한 분위기의 베트남 요리", address: "4 Bạch Đằng, Da Nang", visitTime: "1시간", transport: "노보텔 바로 옆", familyNote: "한강뷰 레스토랑. 서여사 · 이서방 모시기 좋은 분위기", lat: 16.0675, lng: 108.2245 },
  { emoji: "☕", name: "43 Factory Coffee", category: "카페", area: "다낭", description: "다낭 최고 스페셜티 카페", why: "커피 맛집", address: "43 Trần Phú, Da Nang", visitTime: "1시간", transport: "한시장 근처 도보", familyNote: "코코넛 커피 강추. 에어컨 시원해서 쉬기 좋아요", lat: 16.0690, lng: 108.2230 },
  { emoji: "🏥", name: "호이안 종합병원", category: "병원", area: "호이안", description: "응급 시 이용 가능", why: "비상시 대비", address: "Hoi An General Hospital", visitTime: "비상시", transport: "택시/Grab", familyNote: "여행자 보험 가입 확인 필수", lat: 15.8835, lng: 108.3350 },
  { emoji: "🏥", name: "다낭 C병원", category: "병원", area: "다낭", description: "다낭 외국인 대응 병원", why: "비상시 대비", address: "Da Nang Hospital C", visitTime: "비상시", transport: "택시/Grab", familyNote: "외국인 환자 경험 많은 병원", lat: 16.0640, lng: 108.2170 },
  { emoji: "💱", name: "환전소", category: "환전", area: "호이안", description: "다낭/호이안 환전소", why: "현지 환전", address: "올드타운 주변 다수", visitTime: "10분", transport: "도보", familyNote: "금은방이 환율 좋은 편", lat: 15.8780, lng: 108.3290 },
  { emoji: "⛪", name: "다낭 대성당 (핑크성당)", category: "관광지", area: "다낭", description: "1923년 프랑스 식민시기 건설된 고딕 성당", why: "다낭 시내 대표 랜드마크", address: "156 Tran Phu, Hai Chau, Da Nang", visitTime: "30분", transport: "시내 중심, 한시장 도보 5분", familyNote: "포토 스팟! 외관 감상 위주, 내부는 미사 시간 외 제한", lat: 16.0670, lng: 108.2234 },
  { emoji: "🙏", name: "린응사 (선짜반도)", category: "관광지", area: "다낭", description: "67m 해수관음상, 선짜반도 명소", why: "다낭 상징적 뷰포인트", address: "Linh Ung Pagoda, Son Tra Peninsula", visitTime: "1~1.5시간", transport: "시내에서 택시/Grab 약 10km", familyNote: "아침 일찍 가면 시원하고 한적. 다낭 시내 전경 감상", lat: 16.1003, lng: 108.2779 },
  { emoji: "🪨", name: "오행산 (마블 마운틴)", category: "관광지", area: "다낭", description: "석회암 동굴과 사원, 다낭-호이안 중간", why: "독특한 풍경과 전망", address: "Marble Mountains, Ngu Hanh Son, Da Nang", visitTime: "1.5~2시간", transport: "다낭에서 남쪽 약 8km", familyNote: "엘리베이터 있어 올라가기 편함. 계단 구간은 경사 주의", lat: 15.9967, lng: 108.2630 },
  { emoji: "🛒", name: "롯데마트 다낭", category: "시장", area: "다낭", description: "에어컨 시원한 대형마트, 기념품 쇼핑", why: "커피/과자/연고 등 기념품 구매", address: "6 Nai Nam, Hai Chau, Da Nang", visitTime: "1~2시간", transport: "헬리오 야시장/다운타운 근처", familyNote: "시원하고 깔끔! 더운 낮에 2~3시간 구경하기 좋음", lat: 16.0395, lng: 108.2262 },
  { emoji: "🏬", name: "빈컴플라자 다낭", category: "시장", area: "다낭", description: "다낭 시내 대형 쇼핑몰 (9:30~22:00)", why: "쇼핑/식사/놀이 복합몰", address: "910A Ngo Quyen, Son Tra, Da Nang", visitTime: "2~3시간", transport: "시내 중심", familyNote: "4층 푸드코트, 아이스링크, 영화관. 한시장보다 깔끔하고 가격 합리적", lat: 16.0602, lng: 108.2105 },
  { emoji: "🦀", name: "선짜 야시장", category: "시장", area: "다낭", description: "해산물 중심 스트릿 야시장", why: "다낭 대표 야시장 체험", address: "Mai Hac De, Son Tra, Da Nang", visitTime: "1~2시간", transport: "시내에서 택시 10분", familyNote: "해산물 호객 주의. 활기찬 로컬 분위기 체험", lat: 16.0725, lng: 108.2285 },
];

interface PlaceCategory {
  title: string;
  emoji: string;
  area: "다낭" | "호이안" | "all";
  items: { name: string; tip: string }[];
}

const placeCategories: PlaceCategory[] = [
  { title: "호이안 맛집", emoji: "🍜", area: "호이안", items: [
    { name: "White Rose (화이트 로즈)", tip: "새우 쌀떡 만두, 부드러운 맛" },
    { name: "Cao Lau (까오 라우)", tip: "호이안에서만 먹을 수 있는 쫄깃 면" },
    { name: "Mi Quang (미꽝)", tip: "다낭 대표 면요리, 다양한 재료에 복잡한 맛" },
    { name: "4P's Pizza (포피스피자)", tip: "미소+연어사시미 피자! 베트남 핫 브랜드" },
  ]},
  { title: "다낭 맛집", emoji: "🍖", area: "다낭", items: [
    { name: "Phở Bà Vị", tip: "현지인 줄서는 쌀국수. 아침식사 추천" },
    { name: "Bún chả cá Bà Hường", tip: "다낭 대표 어묵국수, 꼭 먹어보기" },
    { name: "Madame Lân", tip: "한강뷰 레스토랑. 서여사 · 이서방 모시기 딱" },
  ]},
  { title: "카페", emoji: "☕", area: "all", items: [
    { name: "콩카페 (Cong Caphe)", tip: "코코넛 커피 추천. 다낭점은 한국인 90%" },
    { name: "하이랜드 커피 (Highlands)", tip: "베트남의 스타벅스. 한국인 적은 편" },
    { name: "43 Factory Coffee (다낭)", tip: "다낭 최고 스페셜티. 에어컨 시원" },
    { name: "코코넛 커피/스무디", tip: "어디서나 약 3~5만동" },
  ]},
  { title: "쇼핑", emoji: "🛍️", area: "all", items: [
    { name: "빈컴플라자", tip: "에어컨 시원! 4층 푸드코트, 기념품 깔끔하게" },
    { name: "롯데마트/고마트", tip: "커피, 망고칩, 연고 등 소모품 기념품" },
    { name: "한시장", tip: "1층 먹거리/건망고/커피, 2층 아오자이/라탄백. 흥정 필수" },
  ]},
  { title: "해변", emoji: "🏖️", area: "all", items: [
    { name: "미케 비치 (다낭)", tip: "숙소에서 가까우면 가볍게. 비치바 야경 추천" },
    { name: "안방 비치 (호이안)", tip: "호이안 근처, 조용하고 여유로움" },
  ]},
  { title: "액티비티", emoji: "🎯", area: "all", items: [
    { name: "코코넛 보트 (호이안)", tip: "방수팩 챙기기" },
    { name: "오행산 트레킹", tip: "엘리베이터 이용 가능. 동굴+전망 포인트" },
    { name: "선짜반도 드라이브", tip: "린응사+반코봉+원숭이. 날씨 맑은 날 추천" },
  ]},
];

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

function FitBounds({ places: pts }: { places: MapPlace[] }) {
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
  const [selected, setSelected] = useState<MapPlace | null>(null);
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
        {(["all", "다낭", "호이안"] as AreaKey[]).map((key) => {
          const isActive = activeArea === key;
          const emoji = key === "all" ? "🗺️" : key === "다낭" ? "🏙️" : "🏮";
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
          center={[15.97, 108.18]}
          zoom={11}
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
              place.area === "다낭"
                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                : "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
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
                    selected.area === "다낭"
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      : "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
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
