import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Phone, AlertTriangle } from "lucide-react";
import { tripConfig } from "@/config/trip";
import { useTripWeather } from "@/hooks/useWeather";
import { useOnline } from "@/hooks/useOnline";
import { cn } from "@/lib/utils";
import NavButton from "./NavButton";
import type { DaySchedule, ScheduleEvent, ScheduleType, RouteStop, Stay, StayFacilities } from "@/config/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;

/**
 * 조수석 내비게이터 — 오늘(Today) 탭.
 *
 * 자차 2인 여행의 핵심 질문은 "다음에 어디 가지?" 다. 일정 타임라인이 화면의 중심이고,
 * 숙소 정보는 오프라인에서도 100% 보여야 한다. 날씨만 네트워크에 의존하며 실패해도
 * 화면이 깨지지 않는다.
 */

// ─────────────────────────────────────────────
// 날씨 계약 — hooks/useWeather.ts 가 아직 새 계약(useTripWeather)으로 바뀌지 않은 동안에도
// 이 파일 자체는 완전히 타입 안전하게 유지하기 위해 계약을 로컬로 명시한다.
// ─────────────────────────────────────────────

interface WeatherCurrent {
  temp: number;
  description: string;
  icon: string;
  feelsLike?: number;
}

interface WeatherDaily {
  date: string;
  min: number;
  max: number;
  description: string;
  icon: string;
  /** 강수확률(%). hooks/useWeather.ts 가 0~100 정수로 반환한다. */
  pop?: number;
}

interface WeatherAlert {
  event: string;
  description?: string;
}

interface TripWeatherResult {
  loading: boolean;
  error: boolean;
  current?: WeatherCurrent;
  daily?: WeatherDaily[];
  alerts?: WeatherAlert[];
}

// ─────────────────────────────────────────────
// 시간 유틸 — KST(+09:00) 기준으로 "오늘"과 "다음 일정"을 판별한다.
// tripStart/tripEnd 는 이미 +09:00 오프셋을 포함하므로 Date 비교는 타임존과 무관하게 정확하다.
// 달력상의 날짜(YYYY-MM-DD)를 비교해야 하는 곳만 KST 로 명시적으로 포맷한다.
// ─────────────────────────────────────────────

const KST_TIME_ZONE = "Asia/Seoul";
const kstDateFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: KST_TIME_ZONE });
const kstTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: KST_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const TRIP_START = new Date(tripConfig.tripStart);
const TRIP_END = new Date(tripConfig.tripEnd);
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** 여행 1일차(day 1) 기준 n번째 날의 Date. */
function dateForDay(dayNumber: number): Date {
  return new Date(TRIP_START.getTime() + (dayNumber - 1) * MS_PER_DAY);
}

/** "HH:mm" 형식만 분 단위로 파싱한다. "오전"/"점심" 같은 문자열은 조용히 null 을 반환한다. */
function parseTimeToMinutes(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return hour * 60 + minute;
}

function nowKstMinutes(): number {
  const parts = kstTimeFormatter.formatToParts(new Date());
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return hour * 60 + minute;
}

/** "8월 14일" → "8/14" */
function shortDate(dateStr: string): string {
  const match = /(\d+)월\s*(\d+)일/.exec(dateStr);
  return match ? `${match[1]}/${match[2]}` : dateStr;
}

// ─────────────────────────────────────────────
// 일정 타입 표시
// ─────────────────────────────────────────────

const TYPE_CONFIG: Record<ScheduleType, { icon: string; text: string; dot: string }> = {
  move: { icon: "🚗", text: "text-ocean", dot: "border-ocean" },
  food: { icon: "🍽️", text: "text-coral", dot: "border-coral" },
  stay: { icon: "🏠", text: "text-pine", dot: "border-pine" },
  activity: { icon: "🎯", text: "text-sky", dot: "border-sky" },
  flight: { icon: "✈️", text: "text-ocean", dot: "border-ocean" },
  placeholder: { icon: "❓", text: "text-muted-foreground", dot: "border-muted-foreground" },
};

// ─────────────────────────────────────────────
// 지도 마커
// ─────────────────────────────────────────────

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function createEmojiIcon(emoji: string) {
  return L.divIcon({
    html: `<div style="font-size:16px;text-align:center;line-height:32px;width:32px;height:32px;background:hsl(var(--card));border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.25);border:2px solid hsl(var(--pine));">${escapeHtml(emoji)}</div>`,
    className: "emoji-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

// ─────────────────────────────────────────────
// 이동경로 지도 — day.stops 가 있을 때만 호출된다. 오프라인이면 텍스트 목록으로 폴백해
// 지도 영역이 깨지거나 무한 로딩처럼 보이지 않게 한다.
// ─────────────────────────────────────────────

function RouteSection({ stops }: { stops: RouteStop[] }) {
  const isOnline = useOnline();

  return (
    <div className="card-base">
      <p className="text-sm font-bold text-foreground mb-3">🗺️ 오늘의 이동경로</p>
      {isOnline ? (
        <div className="relative z-0 rounded-2xl overflow-hidden border border-border" style={{ height: 200 }}>
          <MapContainer
            key={stops.map((s, i) => `${s.name}-${i}-${s.lat}-${s.lng}`).join("|")}
            bounds={L.latLngBounds(stops.map((s) => [s.lat, s.lng] as [number, number]))}
            boundsOptions={{ padding: [24, 24] }}
            style={{ height: "100%", width: "100%" }}
            zoomControl={false}
            dragging={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            touchZoom={false}
            attributionControl={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {stops.map((stop, i) => (
              <Marker key={`${stop.name}-${i}`} position={[stop.lat, stop.lng]} icon={createEmojiIcon(stop.emoji)} />
            ))}
            <Polyline
              positions={stops.map((s) => [s.lat, s.lng] as [number, number])}
              pathOptions={{ color: "hsl(var(--pine))", weight: 3, opacity: 0.85, dashArray: "6 4" }}
            />
          </MapContainer>
        </div>
      ) : (
        <div>
          <p className="text-xs text-muted-foreground mb-3">
            오프라인이라 지도 타일을 불러올 수 없어요. 경유지는 이 순서예요.
          </p>
          <ol className="space-y-1.5">
            {stops.map((stop, i) => (
              <li key={`${stop.name}-${i}`} className="flex items-center gap-2 text-sm text-foreground">
                <span className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                  {i + 1}
                </span>
                <span>
                  {stop.emoji} {stop.name}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// 숙소 카드 — 오프라인에서도 반드시 보여야 하는 정보. 네트워크에 전혀 의존하지 않는다.
// ─────────────────────────────────────────────

const FACILITY_LABELS: { key: keyof StayFacilities; emoji: string; label: string }[] = [
  { key: "aircon", emoji: "❄️", label: "에어컨" },
  { key: "toilet", emoji: "🚻", label: "화장실" },
  { key: "kitchen", emoji: "🍳", label: "주방" },
  { key: "electricity", emoji: "🔌", label: "전기" },
  { key: "bedding", emoji: "🛏️", label: "침구" },
  { key: "shower", emoji: "🚿", label: "샤워" },
  { key: "wifi", emoji: "📶", label: "와이파이" },
  { key: "parking", emoji: "🅿️", label: "주차" },
];

function StayCard({ stay }: { stay: Stay }) {
  const activeFacilities = FACILITY_LABELS.filter((f) => stay.facilities[f.key]);

  return (
    <div className="card-base space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-muted-foreground">숙소</p>
          <h3 className="text-lg font-bold text-foreground">{stay.name}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{stay.address}</p>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-pine/10 text-pine border border-pine/25 whitespace-nowrap flex-shrink-0">
          {stay.nights}
        </span>
      </div>

      {(stay.checkIn || stay.checkOut) && (
        <div className="grid grid-cols-2 gap-2">
          {stay.checkIn && (
            <div className="rounded-xl p-3 text-center bg-secondary/50">
              <p className="text-xs text-muted-foreground mb-0.5">체크인</p>
              <p className="text-sm font-bold text-primary">{stay.checkIn}</p>
            </div>
          )}
          {stay.checkOut && (
            <div className="rounded-xl p-3 text-center bg-secondary/50">
              <p className="text-xs text-muted-foreground mb-0.5">체크아웃</p>
              <p className="text-sm font-bold text-foreground">{stay.checkOut}</p>
            </div>
          )}
        </div>
      )}

      {stay.accessNote && (
        <div className="flex gap-2 rounded-xl border border-coral/30 bg-coral/10 p-3">
          <AlertTriangle className="w-5 h-5 text-coral flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-coral leading-relaxed font-medium">{stay.accessNote}</p>
        </div>
      )}

      {activeFacilities.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {activeFacilities.map((f) => (
            <span key={f.key} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
              {f.emoji} {f.label}
            </span>
          ))}
        </div>
      )}

      {stay.bring.length > 0 && (
        <div>
          <p className="text-xs font-bold text-muted-foreground mb-1.5">챙길 것</p>
          <ul className="space-y-1">
            {stay.bring.map((item, i) => (
              <li key={i} className="text-sm text-foreground">
                · {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {stay.cautions.length > 0 && (
        <div>
          <p className="text-xs font-bold text-coral mb-1.5">주의</p>
          <ul className="space-y-1">
            {stay.cautions.map((item, i) => (
              <li key={i} className="text-sm text-foreground">
                · {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-2 pt-1">
        {stay.phone && (
          <a
            href={`tel:${stay.phone.replace(/[^+\d]/g, "")}`}
            className="inline-flex items-center justify-center gap-2 min-h-11 rounded-xl bg-secondary text-secondary-foreground font-bold text-sm active:scale-[0.98] transition-transform"
          >
            <Phone className="w-4 h-4" aria-hidden="true" /> {stay.phone} 전화
          </a>
        )}
        <NavButton place={stay.place} name={stay.name} variant="full" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 기상특보 배너 — 있으면 항상 화면 최상단에 경고색으로.
// ─────────────────────────────────────────────

function WeatherAlertBanner({ alerts }: { alerts: WeatherAlert[] }) {
  return (
    <div role="alert" className="rounded-2xl border-2 border-destructive/40 bg-destructive/10 p-4 space-y-2">
      <p className="text-sm font-bold text-destructive flex items-center gap-1.5">
        <AlertTriangle className="w-4 h-4" aria-hidden="true" /> 기상특보
      </p>
      {alerts.map((alert, i) => (
        <div key={i}>
          <p className="text-sm font-bold text-destructive">{alert.event}</p>
          {alert.description && <p className="text-xs text-destructive/90 mt-0.5">{alert.description}</p>}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// 다음 일정 요약 카드 — "다음에 어디 가지?"에 스크롤 없이 답한다.
// 여행 중이고 선택된 날이 오늘일 때, 유효한 다음 일정(nextEventIndex)이 있을 때만 그린다.
// 웜톤(accent/sand)은 이 앱에서 "지금"을 의미하므로 그대로 accent-ring 을 재사용한다.
// ─────────────────────────────────────────────

function NextUpCard({ event }: { event: ScheduleEvent }) {
  return (
    <div className="rounded-2xl p-4 accent-ring bg-accent/10 flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-sand-deep">다음 일정 · {event.time}</p>
        <p className="text-base font-bold text-foreground truncate mt-0.5">{event.activity}</p>
        {event.durationNote && <p className="text-xs text-muted-foreground mt-0.5">⏱ {event.durationNote}</p>}
      </div>
      {event.place && <NavButton place={event.place} name={event.activity} variant="icon" />}
    </div>
  );
}

// ─────────────────────────────────────────────
// 날씨 카드 — 실패해도 화면이 막히지 않는다.
// ─────────────────────────────────────────────

function WeatherSection({
  day,
  weather,
  label,
  isOnline,
}: {
  day: DaySchedule;
  weather: TripWeatherResult;
  label: string;
  isOnline: boolean;
}) {
  if (weather.loading) {
    return (
      <div className="card-base space-y-2" aria-busy="true">
        <div className="h-3.5 w-24 bg-secondary rounded animate-pulse" />
        <div className="h-9 w-full bg-secondary rounded animate-pulse" />
      </div>
    );
  }

  if (weather.error || !isOnline) {
    return (
      <div className="card-base">
        <p className="text-sm text-muted-foreground">🌤️ 날씨는 연결되면 표시돼요</p>
      </div>
    );
  }

  const targetDateStr = kstDateFormatter.format(dateForDay(day.day));
  const forecast = weather.daily?.find((d) => d.date === targetDateStr);

  return (
    <div className="card-base">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold text-foreground">{day.date} 날씨</p>
        <div className="flex items-center gap-1.5">
          {!forecast && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md border border-sand/40 bg-sand/15 text-sand-deep">
              예보 범위 밖
            </span>
          )}
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md border border-border bg-secondary/50 text-muted-foreground">
            {label}
          </span>
        </div>
      </div>

      {forecast ? (
        <div className="flex items-center gap-4">
          <span className="text-4xl">{forecast.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground truncate">{forecast.description}</p>
            <p className="text-base font-bold text-foreground tabular-nums">
              <span className="text-coral">{forecast.max}°</span>
              <span className="text-muted-foreground mx-1">/</span>
              <span className="text-ocean">{forecast.min}°</span>
            </p>
          </div>
          {typeof forecast.pop === "number" && (
            <p className="text-xs text-muted-foreground flex-shrink-0">☔ {forecast.pop}%</p>
          )}
        </div>
      ) : weather.current ? (
        <div className="flex items-center gap-4">
          <span className="text-4xl">{weather.current.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground truncate">{weather.current.description}</p>
            <p className="text-base font-bold text-foreground tabular-nums">
              현재 {weather.current.temp}°
              {typeof weather.current.feelsLike === "number" && (
                <span className="text-xs font-normal text-muted-foreground ml-1.5">체감 {weather.current.feelsLike}°</span>
              )}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">날씨 정보가 없어요</p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// 체크리스트 — 출발 전 준비물 · 하루 준비물 공용. localStorage 저장은 실패해도 무시한다.
// ─────────────────────────────────────────────

function ChecklistCard({ title, items, storageKey }: { title: string; items: string[]; storageKey: string }) {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggle = (item: string) => {
    setChecked((prev) => {
      const next = { ...prev, [item]: !prev[item] };
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // 저장 실패는 무시 — 체크 상태가 이번 세션에만 유지된다
      }
      return next;
    });
  };

  const doneCount = items.filter((item) => checked[item]).length;

  return (
    <div className="card-base">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-base font-bold text-foreground">{title}</h4>
        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary tabular-nums">
          {doneCount}/{items.length}
        </span>
      </div>
      <div className="space-y-1">
        {items.map((item) => {
          const isChecked = !!checked[item];
          return (
            <label
              key={item}
              className={cn(
                "flex items-center gap-3 min-h-11 px-2 rounded-xl cursor-pointer transition-colors",
                isChecked ? "bg-secondary/50" : "bg-transparent"
              )}
            >
              <input
                type="checkbox"
                className="w-5 h-5 accent-primary flex-shrink-0"
                checked={isChecked}
                onChange={() => toggle(item)}
              />
              <span className={cn("text-sm", isChecked ? "text-muted-foreground line-through" : "text-foreground")}>
                {item}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 메인
// ─────────────────────────────────────────────

const TodayTab = () => {
  const isOnline = useOnline();

  const { phase, todayIndex, daysLeft } = useMemo(() => {
    const now = new Date();
    let p: "before" | "during" | "after" = "during";
    if (now.getTime() < TRIP_START.getTime()) p = "before";
    else if (now.getTime() > TRIP_END.getTime()) p = "after";

    let idx = -1;
    if (p === "during") {
      const nowStr = kstDateFormatter.format(now);
      idx = tripConfig.schedule.findIndex((d) => kstDateFormatter.format(dateForDay(d.day)) === nowStr);
      if (idx === -1) {
        // 날짜 문자열 매칭에 실패하면(예: 자정 근처 오차) 경과일 수로 근사한다
        const elapsed = Math.floor((now.getTime() - TRIP_START.getTime()) / MS_PER_DAY);
        idx = Math.min(Math.max(elapsed, 0), tripConfig.schedule.length - 1);
      }
    }

    const dl = Math.max(0, Math.ceil((TRIP_START.getTime() - now.getTime()) / MS_PER_DAY));
    return { phase: p, todayIndex: idx, daysLeft: dl };
  }, []);

  const [selectedIndex, setSelectedIndex] = useState(() => (phase === "during" && todayIndex >= 0 ? todayIndex : 0));

  const selectedDay = tripConfig.schedule[selectedIndex] ?? tripConfig.schedule[0];
  const isSelectedToday = phase === "during" && selectedIndex === todayIndex;

  const weatherIndex = selectedDay.weatherIndex ?? tripConfig.weather.defaultIndex;
  const weather: TripWeatherResult = useTripWeather(weatherIndex);
  const weatherLocation = tripConfig.weather.locations[weatherIndex];
  const weatherLabel = weatherLocation?.label ?? weatherLocation?.city ?? "날씨";

  const nextEventIndex = useMemo(() => {
    if (!isSelectedToday) return -1;
    const nowMin = nowKstMinutes();
    return selectedDay.schedule.findIndex((event) => {
      const minutes = parseTimeToMinutes(event.time);
      return minutes !== null && minutes >= nowMin;
    });
  }, [isSelectedToday, selectedDay]);

  const stay = selectedDay.stayIndex != null ? tripConfig.stays[selectedDay.stayIndex] : undefined;
  const areaColor = tripConfig.areaBadgeColors[selectedDay.location];

  if (!selectedDay) return null;

  return (
    <div className="space-y-4 fade-in">
      {phase === "before" && (
        <>
          <div className="card-highlight text-center">
            <p className="text-sm font-medium opacity-90">{tripConfig.headerLabel}</p>
            <p className="text-5xl font-black mt-2 tabular-nums">D-{daysLeft}</p>
            <p className="text-sm opacity-90 mt-1">{tripConfig.meta.subtitle}</p>
          </div>

          <ChecklistCard
            title="출발 전 체크리스트"
            items={tripConfig.checklist.map((c) => c.text)}
            storageKey="trip-checklist"
          />

          <div className="card-base space-y-3">
            <h4 className="text-base font-bold text-foreground">옷차림 · 짐</h4>
            <div>
              <p className="text-xs font-bold text-primary mb-1.5">👕 옷차림</p>
              <ul className="space-y-1 text-sm text-foreground">
                {tripConfig.packingGuide.clothing.map((item, i) => (
                  <li key={i}>· {item}</li>
                ))}
              </ul>
            </div>
            <div className="border-t border-border pt-3">
              <p className="text-xs font-bold text-primary mb-1.5">🧳 짐</p>
              <ul className="space-y-1 text-sm text-foreground">
                {tripConfig.packingGuide.luggage.map((item, i) => (
                  <li key={i}>· {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}

      {phase === "after" && (
        <div className="card-highlight text-center">
          <p className="text-3xl mb-1">🎉</p>
          <p className="text-lg font-bold">즐거운 여행이었어요!</p>
          <p className="text-sm opacity-90 mt-1">{tripConfig.areas.join(" · ")} 다녀왔어요</p>
        </div>
      )}

      {/* ── Day 선택 ── */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
        {tripConfig.schedule.map((d, i) => {
          const isSelected = i === selectedIndex;
          const isToday = phase === "during" && i === todayIndex;
          return (
            <button
              key={d.day}
              type="button"
              onClick={() => setSelectedIndex(i)}
              className={cn(
                "flex flex-col items-center justify-center flex-shrink-0 min-w-[4.5rem] min-h-11 rounded-2xl px-3 py-2 border transition-all active:scale-[0.97]",
                isSelected ? "bg-primary border-primary shadow-sm" : "bg-card border-border",
                isToday && "accent-ring"
              )}
            >
              <span className={cn("text-xs font-bold", isSelected ? "text-primary-foreground/80" : "text-muted-foreground")}>
                {isToday ? "오늘" : `${d.weekday}요일`}
              </span>
              <span className={cn("text-sm font-bold mt-0.5", isSelected ? "text-primary-foreground" : "text-foreground")}>
                {shortDate(d.date)}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── 선택된 날 ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          {weather.alerts && weather.alerts.length > 0 && !weather.error && (
            <WeatherAlertBanner alerts={weather.alerts} />
          )}

          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-foreground min-w-0 truncate">
              Day {selectedDay.day} · {selectedDay.title}
            </h3>
            <span
              className={cn(
                "text-xs font-semibold px-2 py-0.5 rounded-md border flex-shrink-0",
                areaColor
                  ? [areaColor.bg, areaColor.text, areaColor.border].filter(Boolean).join(" ")
                  : "bg-secondary text-secondary-foreground border-border"
              )}
            >
              {selectedDay.location}
            </span>
          </div>

          {isSelectedToday && nextEventIndex !== -1 && (
            <NextUpCard event={selectedDay.schedule[nextEventIndex]} />
          )}

          {stay && <StayCard stay={stay} />}

          {selectedDay.stops && selectedDay.stops.length > 0 && <RouteSection stops={selectedDay.stops} />}

          <WeatherSection day={selectedDay} weather={weather} label={weatherLabel} isOnline={isOnline} />

          {/* Timeline */}
          <div className="card-base">
            <h4 className="text-sm font-bold text-foreground mb-4">
              {selectedDay.date} ({selectedDay.weekday}) 일정
            </h4>
            <div className="relative">
              <div className="absolute left-[1.6rem] top-3 bottom-3 w-px bg-border" />
              <div className="space-y-1">
                {selectedDay.schedule.map((event, i) => {
                  const config = TYPE_CONFIG[event.type];
                  const isPlaceholder = event.type === "placeholder";
                  const isNext = i === nextEventIndex;
                  return (
                    <div key={i} className="flex gap-3 items-start relative py-2">
                      <div className="flex flex-col items-center flex-shrink-0 w-11 z-10">
                        <span className={cn("text-xs font-bold tabular-nums", config.text)}>{event.time}</span>
                        <div className={cn("w-3 h-3 rounded-full mt-1 border-2 bg-card", config.dot)} />
                      </div>
                      <div
                        className={cn(
                          "flex-1 min-w-0 rounded-xl p-3",
                          isPlaceholder ? "border border-dashed border-muted-foreground/40 bg-muted/20" : "bg-secondary/40",
                          isNext && "accent-ring bg-accent/10"
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className={cn("text-sm font-semibold", isPlaceholder ? "text-muted-foreground" : "text-foreground")}>
                            {config.icon} {event.activity}
                          </p>
                          {isPlaceholder && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-dashed border-muted-foreground/50 text-muted-foreground flex-shrink-0">
                              미정
                            </span>
                          )}
                        </div>
                        {event.detail && <p className="text-xs text-muted-foreground mt-0.5">{event.detail}</p>}
                        {event.durationNote && <p className="text-xs text-muted-foreground mt-0.5">⏱ {event.durationNote}</p>}
                        {event.place && (
                          <div className="mt-2 flex justify-end">
                            <NavButton place={event.place} name={event.activity} variant="icon" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Day tip */}
          <div className="rounded-2xl p-4 border border-primary/18 bg-primary/6">
            <p className="text-sm font-bold text-primary mb-1">{tripConfig.dayTipLabel}</p>
            <p className="text-sm text-foreground leading-relaxed">{selectedDay.dayTip}</p>
          </div>

          {/* 준비물 */}
          {selectedDay.preparation.length > 0 && (
            <ChecklistCard title="오늘의 준비물" items={selectedDay.preparation} storageKey={`trip-day${selectedDay.day}-prep`} />
          )}

          {/* 식사 */}
          {selectedDay.meals.length > 0 && (
            <div className="rounded-2xl p-4 border border-coral/25 bg-coral/8">
              <p className="text-sm font-bold text-coral mb-2">🍴 식사</p>
              {selectedDay.meals.map((meal, i) => (
                <p key={i} className="text-sm text-foreground leading-relaxed">
                  {meal}
                </p>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default TodayTab;
