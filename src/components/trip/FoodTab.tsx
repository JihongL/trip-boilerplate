import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Phone, ShieldCheck } from "lucide-react";
import { tripConfig } from "@/config/trip";
import type { MealTime, Restaurant, VerificationStatus } from "@/config/types";
import NavButton from "./NavButton";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────
 * 영업 상태 계산
 *
 * 성수기 강원도에서 진짜 페인포인트는 별점이 아니라 "지금 갈 수 있나"다.
 * 이 함수는 컴포넌트 밖 순수 함수로 분리해 테스트 가능하게 export 한다.
 * ───────────────────────────────────────────── */

export type OpenStateKind = "open" | "break" | "closed" | "day-off" | "unknown";

export interface OpenState {
  kind: OpenStateKind;
  label: string;
  /** 예: "17:00 영업 재개" */
  detail?: string;
}

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

/**
 * 한국 시간(Asia/Seoul) 기준 요일(0=일…6=토)과 자정 이후 분(0~1439)을 계산한다.
 * 사용자의 로컬 타임존이 무엇이든 Asia/Seoul 로 명시 변환하므로 깨지지 않는다.
 */
function getKoreaTimeParts(now: Date): { weekday: number; minutesSinceMidnight: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const map: Partial<Record<string, string>> = {};
  for (const part of parts) map[part.type] = part.value;

  const weekday = WEEKDAY_INDEX[map.weekday ?? "Sun"] ?? 0;
  // hourCycle h23 는 자정을 "00"으로 주지만 일부 환경 대비 방어적으로 24 로 나눈다.
  const hour = Number(map.hour ?? "0") % 24;
  const minute = Number(map.minute ?? "0");
  return { weekday, minutesSinceMidnight: hour * 60 + minute };
}

function toMinutes(hhmm: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return hour * 60 + minute;
}

/** start~end 구간에 t 가 속하는지 판정. start > end 면 자정을 넘기는 영업시간(예: 11:00~02:00)으로 처리한다. */
function isWithin(start: number, end: number, t: number): boolean {
  if (start === end) return false;
  return start < end ? t >= start && t < end : t >= start || t < end;
}

/**
 * Restaurant.openHours / closedWeekdays 로 "지금" 기준 영업 상태를 계산하는 순수 함수.
 * openHours 가 없으면 절대 "영업중"으로 추측하지 않고 "영업시간 미확인"을 반환한다.
 */
export function getOpenState(restaurant: Restaurant, now: Date): OpenState {
  const { weekday, minutesSinceMidnight: t } = getKoreaTimeParts(now);

  if (!restaurant.openHours) {
    if (restaurant.closedWeekdays?.includes(weekday)) {
      return { kind: "day-off", label: "오늘 휴무" };
    }
    return { kind: "unknown", label: "영업시간 미확인" };
  }

  const { open, close, breakStart, breakEnd } = restaurant.openHours;
  const openMinutes = toMinutes(open);
  const closeMinutes = toMinutes(close);
  const breakStartMinutes = breakStart ? toMinutes(breakStart) : null;
  const breakEndMinutes = breakEnd ? toMinutes(breakEnd) : null;

  if (
    openMinutes === null ||
    closeMinutes === null ||
    (breakStart === undefined) !== (breakEnd === undefined) ||
    (breakStart !== undefined && breakStartMinutes === null) ||
    (breakEnd !== undefined && breakEndMinutes === null)
  ) {
    return { kind: "unknown", label: "영업시간 미확인" };
  }

  // 자정을 넘긴 새벽 영업분은 전날 영업일에 속한다.
  // 예: 금요일 18:00~토요일 02:00의 01:00은 금요일 휴무 여부를 따져야 한다.
  const crossesMidnight = openMinutes > closeMinutes;
  const serviceWeekday = crossesMidnight && t < closeMinutes ? (weekday + 6) % 7 : weekday;

  if (restaurant.closedWeekdays?.includes(serviceWeekday)) {
    return { kind: "day-off", label: "오늘 휴무" };
  }

  const isBreakTime =
    breakStart &&
    breakEnd &&
    breakStartMinutes !== null &&
    breakEndMinutes !== null &&
    isWithin(breakStartMinutes, breakEndMinutes, t);
  const isOpenTime = isWithin(openMinutes, closeMinutes, t);

  // closedWeekdays 미지정 + closedDays "확인 필요"면 주간 휴무일을 모른다.
  // 시각만 맞는다고 "영업중"이나 "브레이크타임"으로 단정하지 않는다.
  const weeklyClosureKnown = restaurant.closedWeekdays !== undefined || restaurant.closedDays.trim() === "없음";
  if ((isOpenTime || isBreakTime) && !weeklyClosureKnown) {
    return { kind: "unknown", label: "영업여부 미확인" };
  }

  if (isBreakTime) {
    return { kind: "break", label: "브레이크타임", detail: `${breakEnd} 영업 재개` };
  }

  if (isOpenTime) {
    return { kind: "open", label: "영업중" };
  }

  return { kind: "closed", label: "영업 종료" };
}

const OPEN_STATE_BADGE_STYLE: Record<OpenStateKind, string> = {
  open: "bg-accent text-accent-foreground",
  break: "bg-secondary text-secondary-foreground",
  closed: "bg-secondary text-secondary-foreground",
  "day-off": "bg-secondary text-secondary-foreground",
  unknown: "bg-muted text-muted-foreground border border-border",
};

/* ─────────────────────────────────────────────
 * 필터 · 정렬
 * ───────────────────────────────────────────── */

const AREA_ALL = "전체";
const MEAL_ALL = "전체";
const MEAL_TIME_FILTERS: MealTime[] = ["아침", "점심", "저녁", "카페"];

/** 영업중 → 수상 이력 있음 → 평점순. 선택지를 늘리지 않는 고정 정렬. */
function sortRestaurants(restaurants: Restaurant[], now: Date): Restaurant[] {
  return [...restaurants].sort((a, b) => {
    const openA = getOpenState(a, now).kind === "open" ? 1 : 0;
    const openB = getOpenState(b, now).kind === "open" ? 1 : 0;
    if (openA !== openB) return openB - openA;

    const awardA = (a.credentials.awards?.length ?? 0) > 0 ? 1 : 0;
    const awardB = (b.credentials.awards?.length ?? 0) > 0 ? 1 : 0;
    if (awardA !== awardB) return awardB - awardA;

    const ratingA = a.credentials.rating?.score ?? 0;
    const ratingB = b.credentials.rating?.score ?? 0;
    return ratingB - ratingA;
  });
}

/* ─────────────────────────────────────────────
 * 컴포넌트
 * ───────────────────────────────────────────── */

export default function FoodTab() {
  const [now, setNow] = useState(() => new Date());
  const [area, setArea] = useState<string>(AREA_ALL);
  const [mealTime, setMealTime] = useState<string>(MEAL_ALL);

  // 브레이크타임 진입 등 상태 변화를 반영하기 위해 1분마다 갱신
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const restaurants = tripConfig.restaurants;

  const filtered = useMemo(() => {
    const byFilter = restaurants.filter((r) => {
      if (area !== AREA_ALL && r.area !== area) return false;
      if (mealTime !== MEAL_ALL && !r.mealTime.includes(mealTime as MealTime)) return false;
      return true;
    });
    return sortRestaurants(byFilter, now);
  }, [restaurants, area, mealTime, now]);

  return (
    <div className="space-y-4 fade-in">
      <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20">
        <p className="text-sm text-foreground">💡 정보는 현장 상황과 다를 수 있어요</p>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1" role="group" aria-label="지역 필터">
        {[AREA_ALL, ...tripConfig.areas].map((a) => (
          <button
            key={a}
            type="button"
            aria-pressed={area === a}
            onClick={() => setArea(a)}
            className={cn(
              "flex-shrink-0 min-h-11 px-4 rounded-full text-sm font-bold border transition-colors",
              area === a
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border"
            )}
          >
            {a}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1" role="group" aria-label="끼니 필터">
        {[MEAL_ALL, ...MEAL_TIME_FILTERS].map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mealTime === m}
            onClick={() => setMealTime(m)}
            className={cn(
              "flex-shrink-0 min-h-11 px-4 rounded-full text-sm font-bold border transition-colors",
              mealTime === m
                ? "bg-pine text-white border-pine"
                : "bg-card text-foreground border-border"
            )}
          >
            {m}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card-base text-center py-10">
          <p className="text-base text-muted-foreground">조건에 맞는 맛집이 없어요</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} now={now} />
          ))}
        </div>
      )}
    </div>
  );
}

interface RestaurantCardProps {
  restaurant: Restaurant;
  now: Date;
}

function RestaurantCard({ restaurant, now }: RestaurantCardProps) {
  const state = getOpenState(restaurant, now);
  const { credentials } = restaurant;
  const reservation = credentials.reservation;
  const reservationBadgeClassName =
    "inline-flex items-center gap-1.5 text-sm font-bold text-primary bg-primary/10 border border-primary/25 rounded-full px-3 py-1.5";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="card-base space-y-3"
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "inline-flex items-center min-h-8 px-3 rounded-full text-sm font-bold",
            OPEN_STATE_BADGE_STYLE[state.kind]
          )}
        >
          {state.label}
          {state.detail ? ` · ${state.detail}` : ""}
        </span>
        <VerificationBadge status={restaurant.verification} />
      </div>

      <div>
        <h3 className="text-lg font-bold text-foreground">{restaurant.name}</h3>
        <p className="text-sm text-muted-foreground">
          {restaurant.area} · {restaurant.category}
        </p>
      </div>

      {restaurant.signature.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {restaurant.signature.map((menu) => (
            <span key={menu} className="text-sm font-medium text-foreground bg-secondary/60 rounded-full px-3 py-1">
              {menu}
            </span>
          ))}
        </div>
      )}

      {(credentials.awards?.length || credentials.rating) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {credentials.awards?.map((award) => (
            <span
              key={award}
              className="text-xs font-bold text-pine bg-pine/10 border border-pine/25 rounded-full px-2.5 py-1"
            >
              🏅 {award}
            </span>
          ))}
          {credentials.rating && (
            <span className="text-sm font-medium text-foreground">
              ⭐ {credentials.rating.score.toFixed(1)} ({credentials.rating.count.toLocaleString("ko-KR")}) ·{" "}
              {credentials.rating.source}
            </span>
          )}
        </div>
      )}

      {reservation?.required &&
        (reservation.url ? (
          <a
            href={reservation.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(reservationBadgeClassName, "active:scale-[0.97] transition-transform")}
          >
            ⚠️ 예약 필수 · {reservation.platform}
          </a>
        ) : (
          <span className={reservationBadgeClassName}>⚠️ 예약 필수 · {reservation.platform}</span>
        ))}

      <div className="flex flex-wrap items-center gap-2">
        <NavButton place={restaurant.place} name={restaurant.name} address={restaurant.address} variant="full" className="flex-1 min-w-0" />
        {restaurant.phone && (
          <a
            href={`tel:${restaurant.phone}`}
            aria-label={`${restaurant.name} 전화 걸기`}
            className="inline-flex items-center justify-center gap-1.5 min-h-11 px-4 rounded-xl text-sm font-bold bg-secondary text-secondary-foreground active:scale-[0.97] transition-transform"
          >
            <Phone className="w-4 h-4" aria-hidden="true" />
            전화
          </a>
        )}
      </div>
    </motion.div>
  );
}

function VerificationBadge({ status }: { status: VerificationStatus }) {
  if (status === "confirmed") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-pine bg-pine/10 border border-pine/25 rounded-full px-2.5 py-1">
        <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
        확인됨
      </span>
    );
  }
  return (
    <span className="inline-flex items-center text-xs font-medium text-muted-foreground bg-muted rounded-full px-2.5 py-1">
      정보 미확인
    </span>
  );
}
