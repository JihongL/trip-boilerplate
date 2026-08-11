import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { tripConfig } from "@/config/trip";

interface IntroProps {
  onEnter: () => void;
}

/** "+09:00" 같은 ISO8601 오프셋을 분 단위로 파싱한다. 없으면 UTC(0)로 취급. */
function parseOffsetMinutes(iso: string): number {
  const match = iso.match(/([+-])(\d{2}):(\d{2})$/);
  if (!match) return 0;
  const sign = match[1] === "-" ? -1 : 1;
  return sign * (parseInt(match[2], 10) * 60 + parseInt(match[3], 10));
}

/** 어떤 시각을 여행 기준 오프셋으로 이동시킨 뒤 "그 오프셋 기준 날짜"의 자정 timestamp(ms)를 구한다. */
function dayStartInOffset(date: Date, offsetMinutes: number): number {
  const shifted = new Date(date.getTime() + offsetMinutes * 60_000);
  return Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate());
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * tripStart 의 타임존 오프셋을 기준으로 날짜 경계를 계산한다.
 * 브라우저 로컬 타임존이 여행지와 다르더라도 하루가 어긋나지 않는다.
 */
function computeDDayLabel(now: Date): string {
  const { tripStart, tripEnd } = tripConfig;
  const offsetMinutes = parseOffsetMinutes(tripStart);

  const nowDay = dayStartInOffset(now, offsetMinutes);
  const startDay = dayStartInOffset(new Date(tripStart), offsetMinutes);
  const endDay = dayStartInOffset(new Date(tripEnd), offsetMinutes);

  if (nowDay < startDay) {
    const diffDays = Math.round((startDay - nowDay) / MS_PER_DAY);
    return `D-${diffDays}`;
  }

  if (nowDay <= endDay) {
    const dayIndex = Math.round((nowDay - startDay) / MS_PER_DAY) + 1;
    return `여행 ${dayIndex}일차`;
  }

  return "여행 완료";
}

const Intro = ({ onEnter }: IntroProps) => {
  const { meta, intro } = tripConfig;
  const [now, setNow] = useState(() => new Date());
  const dDayLabel = useMemo(() => computeDDayLabel(now), [now]);

  useEffect(() => {
    const refreshNow = () => setNow(new Date());
    const timer = window.setInterval(refreshNow, 60_000);
    document.addEventListener("visibilitychange", refreshNow);
    window.addEventListener("pageshow", refreshNow);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshNow);
      window.removeEventListener("pageshow", refreshNow);
    };
  }, []);

  return (
    <div className="header-gradient relative min-h-screen overflow-hidden flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 mx-auto w-full max-w-md text-center"
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-3 text-5xl"
        >
          {meta.countryEmoji}
        </motion.p>

        <h1 className="mb-1 text-2xl font-bold text-white">{intro.title}</h1>
        <p className="mb-1 text-lg text-white/90">{intro.subtitle}</p>
        {intro.description && (
          <p className="mb-3 text-sm text-white/70">{intro.description}</p>
        )}
        <p className="mb-5 text-sm text-white/70">{meta.subtitle}</p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="accent-ring mb-6 inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-6 py-2 text-lg font-bold text-accent-foreground"
        >
          {dDayLabel}
        </motion.div>

        <div className="mb-8 grid grid-cols-2 gap-3">
          {intro.highlights.map((highlight, i) => (
            <motion.div
              key={highlight.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.05, duration: 0.35 }}
              className="rounded-2xl border border-white/20 bg-white/10 p-4 text-white backdrop-blur-sm"
            >
              <p className="mb-1 text-2xl">{highlight.emoji}</p>
              <p className="text-xs text-white/70">{highlight.label}</p>
              <p className="text-base font-bold">{highlight.value}</p>
            </motion.div>
          ))}
        </div>

        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.35 }}
          onClick={onEnter}
          aria-label={intro.enterText}
          className="min-h-[44px] w-full rounded-2xl bg-white py-4 text-lg font-bold text-primary transition-all hover:opacity-90 active:scale-[0.98]"
        >
          {intro.enterText}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Intro;
