import { useState, useMemo } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useWeatherDanang } from "@/hooks/useWeather";

const TRIP_START = new Date("2026-03-20T00:00:00+07:00");
const TRIP_END = new Date("2026-03-23T23:59:59+07:00");

type TripPhase = "before" | "during" | "after";

interface ScheduleItem {
  time: string;
  activity: string;
  detail?: string;
  type: "flight" | "move" | "food" | "stay" | "activity";
}

interface DayData {
  day: number;
  date: string;
  weekday: string;
  title: string;
  location: string;
  schedule: ScheduleItem[];
  meals: string[];
  parentTip: string;
  preparation: string[];
}

const days: DayData[] = [
  {
    day: 1, date: "3월 20일", weekday: "금", title: "호이안 도착 & 올드타운",
    location: "호이안",
    schedule: [
      { time: "06:45", activity: "인천공항 집합", detail: "터미널 2", type: "flight" },
      { time: "09:45", activity: "인천 출발 (KE5769)", type: "flight" },
      { time: "12:30", activity: "다낭 도착", type: "flight" },
      { time: "13:00", activity: "호이안으로 이동", detail: "차량 약 40분", type: "move" },
      { time: "14:00", activity: "호텔 체크인 & 휴식", type: "stay" },
      { time: "16:00", activity: "올드타운 가이드 투어", detail: "일본교 · 중국회관 · 상인 집", type: "activity" },
      { time: "18:00", activity: "저녁 식사", detail: "White Rose · Cao Lau · Mi Quang", type: "food" },
      { time: "19:00", activity: "소원보트 + 야시장", type: "activity" },
    ],
    meals: ["점심: 기내식 또는 도착 후 간단히", "저녁: 호이안 올드타운"],
    parentTip: "도착 후 충분히 쉬고 나서 관광 시작. 무리하지 않기!",
    preparation: ["선크림", "모자", "편한 신발", "물병"],
  },
  {
    day: 2, date: "3월 21일", weekday: "토", title: "액티비티 & 휴식",
    location: "호이안",
    schedule: [
      { time: "08:00", activity: "조식", type: "food" },
      { time: "09:30", activity: "코코넛 보트 체험", detail: "대나무 보트로 수로 탐험", type: "activity" },
      { time: "12:00", activity: "점심 식사", type: "food" },
      { time: "13:30", activity: "호텔 수영장 / 마사지", detail: "서여사 · 이서방 휴식 · 스파 추천", type: "stay" },
      { time: "17:00", activity: "올드타운 재방문 + 저녁", type: "activity" },
    ],
    meals: ["조식: 호텔", "점심: 호이안 로컬", "저녁: 올드타운"],
    parentTip: "오후는 완전 자유시간. 서여사 · 이서방 컨디션에 맞춰 휴식 우선!",
    preparation: ["수영복", "갈아입을 옷", "카메라", "선크림"],
  },
  {
    day: 3, date: "3월 22일", weekday: "일", title: "다낭 이동 & 해변",
    location: "다낭",
    schedule: [
      { time: "08:00", activity: "조식", type: "food" },
      { time: "09:00", activity: "호이안 체크아웃", detail: "Little Oasis Hotel", type: "stay" },
      { time: "10:00", activity: "다낭으로 이동", detail: "차량 약 40분", type: "move" },
      { time: "12:00", activity: "다낭 점심", type: "food" },
      { time: "14:00", activity: "해변 액티비티", detail: "서여사 · 이서방은 해변에서 휴식도 OK", type: "activity" },
      { time: "15:00", activity: "노보텔 체크인", detail: "Novotel Danang Premier Han River", type: "stay" },
      { time: "18:00", activity: "다낭 시내 저녁 식사", type: "food" },
    ],
    meals: ["조식: 호텔", "점심: 다낭", "저녁: 다낭 시내"],
    parentTip: "해변에서 무리하지 말고, 그늘에서 쉬는 시간도 갖기",
    preparation: ["수영복", "선크림", "모자", "샌들"],
  },
  {
    day: 4, date: "3월 23일", weekday: "월", title: "선택 일정 & 귀국",
    location: "다낭",
    schedule: [
      { time: "08:00", activity: "조식", type: "food" },
      { time: "09:00", activity: "바나힐 or 자유시간", detail: "컨디션 안 좋으면 카페에서 휴식", type: "activity" },
      { time: "12:00", activity: "점심", type: "food" },
      { time: "13:00", activity: "공항 이동", type: "move" },
      { time: "15:45", activity: "다낭 출발 (KE0458)", type: "flight" },
      { time: "22:05", activity: "인천 도착", type: "flight" },
    ],
    meals: ["조식: 호텔", "점심: 간단히", "저녁: 기내식"],
    parentTip: "마지막 날은 무리하지 않기! 공항 일찍 가서 면세점 구경",
    preparation: ["여권", "탑승권", "기념품 정리"],
  },
];

const typeConfig: Record<string, { icon: string; color: string }> = {
  flight: { icon: "✈️", color: "hsl(210, 70%, 50%)" },
  move: { icon: "🚗", color: "hsl(280, 50%, 50%)" },
  food: { icon: "🍽️", color: "hsl(20, 85%, 55%)" },
  stay: { icon: "🏨", color: "hsl(170, 40%, 45%)" },
  activity: { icon: "🎯", color: "hsl(45, 90%, 50%)" },
};

const locationBadge: Record<string, string> = {
  "호이안": "bg-amber-100 text-amber-800 border-amber-200",
  "다낭": "bg-sky-100 text-sky-800 border-sky-200",
};

const contentVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

const TodayTab = () => {
  const { now, daysLeft, phase, todayDayIndex } = useMemo(() => {
    const n = new Date();
    const diff = TRIP_START.getTime() - n.getTime();
    const dl = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    const p: TripPhase = n < TRIP_START ? "before" : n > TRIP_END ? "after" : "during";
    let idx = 0;
    if (p === "during") {
      const tripDay = Math.floor((n.getTime() - TRIP_START.getTime()) / (1000 * 60 * 60 * 24));
      idx = Math.min(Math.max(0, tripDay), days.length - 1);
    }
    return { now: n, daysLeft: dl, phase: p, todayDayIndex: idx };
  }, []);

  const [selectedDay, setSelectedDay] = useState(phase === "before" ? -1 : todayDayIndex);
  const day = selectedDay >= 0 ? days[selectedDay] : null;

  const { data: weather } = useWeatherDanang();

  const [checklist, setChecklist] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("trip-checklist");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleChecklistChange = (item: string, checked: boolean) => {
    const next = { ...checklist, [item]: checked };
    setChecklist(next);
    localStorage.setItem("trip-checklist", JSON.stringify(next));
  };

  // Determine if a day index is "today" (during trip)
  const isToday = (idx: number) => phase === "during" && idx === todayDayIndex;

  // All selectable tabs: -1 = 출발 전, 0-3 = Day 1-4
  const allTabs = [
    { id: -1, label: "준비", sublabel: "출발 전", accent: "hsl(170, 40%, 45%)" },
    ...days.map((d, i) => ({
      id: i,
      label: isToday(i) ? "오늘" : d.weekday,
      sublabel: d.date.replace(/^\d+월\s*/, ""),
      accent: i <= 1 ? "hsl(35, 90%, 50%)" : "hsl(210, 70%, 50%)",
    })),
  ];

  return (
    <div className="space-y-5">
      {/* ── Hero ── */}
      <AnimatePresence mode="wait">
        {phase === "before" && (
          <motion.div
            key="hero-before"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl"
            style={{
              background: "linear-gradient(135deg, hsl(20, 85%, 55%) 0%, hsl(35, 90%, 58%) 50%, hsl(170, 40%, 45%) 100%)",
            }}
          >
            <div className="absolute inset-0 opacity-[0.07]" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
            <div className="relative px-6 py-7 text-white text-center">
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-sm font-medium tracking-widest uppercase opacity-80"
              >
                Da Nang · Hoi An
              </motion.p>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35, type: "spring", stiffness: 200 }}
                className="my-3"
              >
                <span className="text-6xl font-black tabular-nums">{daysLeft}</span>
                <span className="text-xl font-bold ml-1 opacity-90">일</span>
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.9 }}
                transition={{ delay: 0.5 }}
                className="text-base font-medium"
              >
                출발까지 남았어요
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 0.6 }}
                className="text-sm mt-1"
              >
                2026.03.20 ~ 03.23 · 3박 4일
              </motion.p>
            </div>
          </motion.div>
        )}

        {phase === "during" && day && (
          <motion.div
            key={`hero-during-${selectedDay}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-3xl"
            style={{
              background: day.location === "호이안"
                ? "linear-gradient(135deg, hsl(35, 80%, 52%) 0%, hsl(25, 90%, 55%) 100%)"
                : "linear-gradient(135deg, hsl(200, 70%, 48%) 0%, hsl(210, 80%, 55%) 100%)",
            }}
          >
            <div className="relative px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-80 tracking-wide">
                    Day {day.day} · {day.location}
                  </p>
                  <h2 className="text-xl font-bold mt-1">{day.title}</h2>
                </div>
                <div className="text-right">
                  <p className="text-3xl">{weather?.current.icon || "☀️"}</p>
                  <p className="text-lg font-bold">{weather?.current.temp || 28}°C</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {phase === "after" && (
          <motion.div
            key="hero-after"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl text-center py-8 px-6"
            style={{
              background: "linear-gradient(135deg, hsl(20, 85%, 55%) 0%, hsl(35, 90%, 58%) 100%)",
            }}
          >
            <p className="text-4xl mb-2">🎉</p>
            <h2 className="text-xl font-bold text-white">즐거운 여행이었어요!</h2>
            <p className="text-white/80 text-sm mt-1">다낭 · 호이안 우리 여행 완료</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weather inline */}
      {phase === "before" && weather && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-3 bg-card rounded-2xl px-4 py-3 border border-border shadow-sm"
        >
          <span className="text-2xl">{weather.current.icon || "🌤️"}</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">다낭 현재 날씨</p>
            <p className="text-xs text-muted-foreground">{weather.current.description}</p>
          </div>
          <p className="text-lg font-bold text-primary">{weather.current.temp}°C</p>
        </motion.div>
      )}

      {/* ── Day Selector ── */}
      <div className="flex gap-2">
        {allTabs.map((tab) => {
          const isActive = selectedDay === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => setSelectedDay(tab.id)}
              layout
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
              className="relative rounded-2xl text-center overflow-hidden"
              style={{
                flex: isActive ? 1.8 : 1,
                minWidth: 0,
              }}
            >
              <motion.div
                layout
                className="flex flex-col items-center justify-center"
                style={{
                  height: 56,
                  padding: "0 4px",
                  background: isActive
                    ? tab.accent
                    : "hsl(var(--card))",
                  borderRadius: "1rem",
                  border: isActive ? "none" : "1px solid hsl(var(--border))",
                  boxShadow: isActive ? "0 4px 16px rgba(0,0,0,0.12)" : "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <motion.p
                  layout="position"
                  className="font-bold leading-tight"
                  style={{
                    fontSize: isActive ? "1.05rem" : "0.9rem",
                    color: isActive ? "white" : "hsl(var(--foreground))",
                  }}
                >
                  {tab.sublabel}
                </motion.p>
                <motion.p
                  layout="position"
                  className="text-xs font-medium leading-tight mt-0.5"
                  style={{
                    color: isActive ? "rgba(255,255,255,0.8)" : "hsl(var(--muted-foreground))",
                  }}
                >
                  {tab.label}
                </motion.p>
              </motion.div>
            </motion.button>
          );
        })}
      </div>

      {/* ── Content ── */}
      <AnimatePresence mode="wait">
        {/* ── 출발 전 ── */}
        {selectedDay === -1 && (
          <motion.div
            key="prep"
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-4"
          >
            {/* 준비 체크리스트 */}
            <motion.div variants={contentVariants} custom={0} className="card-base">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-foreground">준비 체크리스트</h4>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary tabular-nums">
                  {Object.values(checklist).filter(Boolean).length} / 9
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 bg-secondary rounded-full mb-4 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "hsl(var(--primary))" }}
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(Object.values(checklist).filter(Boolean).length / 9) * 100}%`,
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <div className="space-y-1">
                {["여권 (유효기간 6개월 이상)", "항공권 정보 저장", "환전 (베트남 동)", "유심/eSIM 준비", "여행자 보험 가입", "호텔 예약 확인서", "Grab 앱 설치", "상비약 챙기기", "선크림 & 모자"].map((item, i) => {
                  const checked = !!checklist[item];
                  return (
                    <motion.label
                      key={i}
                      variants={contentVariants}
                      custom={i * 0.3}
                      className="flex items-center gap-3 cursor-pointer py-2.5 px-3 rounded-xl min-h-[48px] transition-colors"
                      style={{
                        background: checked ? "hsl(var(--secondary) / 0.5)" : "transparent",
                      }}
                    >
                      <div
                        className="w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all"
                        style={{
                          borderColor: checked ? "hsl(var(--primary))" : "hsl(var(--border))",
                          background: checked ? "hsl(var(--primary))" : "transparent",
                        }}
                      >
                        {checked && (
                          <motion.svg
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            width="14" height="14" viewBox="0 0 14 14" fill="none"
                          >
                            <path d="M3 7L6 10L11 4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </motion.svg>
                        )}
                      </div>
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={(e) => handleChecklistChange(item, e.target.checked)}
                      />
                      <span
                        className="text-base transition-all"
                        style={{
                          color: checked ? "hsl(var(--muted-foreground))" : "hsl(var(--foreground))",
                          textDecoration: checked ? "line-through" : "none",
                        }}
                      >
                        {item}
                      </span>
                    </motion.label>
                  );
                })}
              </div>
            </motion.div>

            {/* 옷차림 & 캐리어 */}
            <motion.div variants={contentVariants} custom={0.8} className="card-base">
              <h4 className="text-lg font-bold text-foreground mb-4">옷차림 & 캐리어</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-bold text-primary mb-1.5">👕 옷차림</p>
                  <ul className="space-y-1.5 text-base text-foreground">
                    <li>· 낮: 반팔/반바지 (평균 25~30°C)</li>
                    <li>· 저녁: 얇은 긴팔 하나 (에어컨/바람)</li>
                    <li>· 비 올 수 있으니 우산 또는 우비</li>
                    <li>· 호이안 사원 방문 시 긴바지 필요</li>
                    <li>· 편한 운동화 + 샌들/슬리퍼</li>
                  </ul>
                </div>
                <div className="border-t border-border pt-3">
                  <p className="text-sm font-bold text-primary mb-1.5">🧳 캐리어</p>
                  <ul className="space-y-1.5 text-base text-foreground">
                    <li>· 위탁 수하물: 23kg × 1개 (대한항공)</li>
                    <li>· 기내 반입: 12kg 이내, 55×40×20cm</li>
                    <li>· 3박이라 24인치면 충분</li>
                    <li>· 기념품 공간 여유 두기</li>
                    <li>· 보조배터리는 기내 반입만 가능</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* 일별 준비물 */}
            <motion.div variants={contentVariants} custom={1.5} className="card-base">
              <h4 className="text-lg font-bold text-foreground mb-4">일별 준비물</h4>
              <div className="space-y-4">
                {days.map((d) => (
                  <div key={d.day}>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-md border"
                        style={{
                          borderColor: d.location === "호이안" ? "hsl(35, 80%, 70%)" : "hsl(210, 70%, 70%)",
                          background: d.location === "호이안" ? "hsl(35, 80%, 95%)" : "hsl(210, 70%, 95%)",
                          color: d.location === "호이안" ? "hsl(35, 80%, 35%)" : "hsl(210, 70%, 35%)",
                        }}
                      >
                        Day {d.day}
                      </span>
                      <span className="text-sm font-semibold text-foreground">{d.title}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pl-1">
                      {d.preparation.map((p, i) => (
                        <span
                          key={i}
                          className="text-sm bg-secondary/70 text-foreground px-3 py-1 rounded-full"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 숙소 */}
            <motion.div variants={contentVariants} custom={2.5} className="space-y-3">
              {/* Little Oasis */}
              <div className="card-base">
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "hsl(35, 80%, 92%)" }}
                  >
                    <span className="text-xl">🏨</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-foreground">Little Oasis Hotel</p>
                    <p className="text-sm text-muted-foreground">215 Lê Thánh Tông, Hội An</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${locationBadge["호이안"]}`}>
                    호이안
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl p-3 text-center" style={{ background: "hsl(var(--secondary) / 0.5)" }}>
                    <p className="text-xs text-muted-foreground mb-0.5">체크인</p>
                    <p className="text-sm font-bold text-primary">3/20 (금) 14:00</p>
                  </div>
                  <div className="rounded-xl p-3 text-center" style={{ background: "hsl(var(--secondary) / 0.5)" }}>
                    <p className="text-xs text-muted-foreground mb-0.5">체크아웃</p>
                    <p className="text-sm font-bold text-foreground">3/22 (일) 12:00</p>
                  </div>
                </div>
              </div>

              {/* Novotel */}
              <div className="card-base">
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "hsl(210, 70%, 93%)" }}
                  >
                    <span className="text-xl">🏨</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-foreground">Novotel Danang Premier</p>
                    <p className="text-sm text-muted-foreground">36 Bach Dang St, Đà Nẵng</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${locationBadge["다낭"]}`}>
                    다낭
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl p-3 text-center" style={{ background: "hsl(var(--secondary) / 0.5)" }}>
                    <p className="text-xs text-muted-foreground mb-0.5">체크인</p>
                    <p className="text-sm font-bold text-primary">3/22 (일) 15:00</p>
                  </div>
                  <div className="rounded-xl p-3 text-center" style={{ background: "hsl(var(--secondary) / 0.5)" }}>
                    <p className="text-xs text-muted-foreground mb-0.5">체크아웃</p>
                    <p className="text-sm font-bold text-foreground">3/23 (월) 12:00</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ── Day 1~4 ── */}
        {day && (
          <motion.div
            key={`day-${selectedDay}`}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-4"
          >
            {/* Hotel card — during trip */}
            {phase === "during" && (
              <>
                {day.day <= 2 && (
                  <motion.div variants={contentVariants} custom={0} className="card-base flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "hsl(35, 80%, 92%)" }}>
                      <span className="text-xl">🏨</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-bold text-foreground">Little Oasis Hotel</p>
                      <p className="text-sm text-muted-foreground">215 Lê Thánh Tông, Hội An</p>
                      {day.day === 2 && <p className="text-xs text-primary font-semibold mt-1">내일 12:00 체크아웃 → 다낭 이동</p>}
                    </div>
                  </motion.div>
                )}
                {day.day === 3 && (
                  <motion.div variants={contentVariants} custom={0} className="space-y-2">
                    <div className="card-base flex items-center gap-3 opacity-50">
                      <span className="text-xl">🏨</span>
                      <div>
                        <p className="text-sm text-muted-foreground line-through">Little Oasis Hotel</p>
                        <p className="text-xs text-muted-foreground">12:00 체크아웃 완료</p>
                      </div>
                    </div>
                    <div className="card-base flex items-center gap-3" style={{ boxShadow: "0 0 0 2px hsl(var(--primary) / 0.25)" }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "hsl(210, 70%, 93%)" }}>
                        <span className="text-xl">🏨</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-bold text-foreground">Novotel Danang Premier</p>
                        <p className="text-sm text-muted-foreground">36 Bach Dang St, Đà Nẵng</p>
                        <p className="text-xs text-primary font-semibold mt-1">15:00 체크인</p>
                      </div>
                    </div>
                  </motion.div>
                )}
                {day.day === 4 && (
                  <motion.div variants={contentVariants} custom={0} className="card-base flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "hsl(210, 70%, 93%)" }}>
                      <span className="text-xl">🏨</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-bold text-foreground">Novotel Danang Premier</p>
                      <p className="text-sm text-muted-foreground">36 Bach Dang St, Đà Nẵng</p>
                      <p className="text-xs font-semibold mt-1" style={{ color: "hsl(var(--destructive))" }}>12:00 체크아웃 · 짐 정리 잊지 마세요!</p>
                    </div>
                  </motion.div>
                )}
              </>
            )}

            {/* Flight info */}
            {(selectedDay === 0 || selectedDay === 3) && (
              <motion.div
                variants={contentVariants}
                custom={0.5}
                className="relative overflow-hidden rounded-2xl border-2"
                style={{
                  borderColor: "hsl(var(--primary) / 0.2)",
                  background: "hsl(var(--card))",
                }}
              >
                {/* Ticket-style top strip */}
                <div
                  className="px-5 py-2.5 flex items-center justify-between"
                  style={{
                    background: selectedDay === 0
                      ? "linear-gradient(135deg, hsl(210, 70%, 50%), hsl(210, 80%, 58%))"
                      : "linear-gradient(135deg, hsl(20, 85%, 55%), hsl(35, 90%, 58%))",
                  }}
                >
                  <span className="text-sm font-bold text-white">
                    {selectedDay === 0 ? "가는편" : "오는편"}
                  </span>
                  <span className="text-sm text-white/80">
                    대한항공 {selectedDay === 0 ? "KE5769" : "KE0458"}
                  </span>
                </div>
                <div className="px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-foreground">{selectedDay === 0 ? "ICN" : "DAD"}</p>
                      <p className="text-sm text-muted-foreground">{selectedDay === 0 ? "인천" : "다낭"}</p>
                      <p className="text-base font-bold text-primary mt-1">{selectedDay === 0 ? "09:45" : "15:45"}</p>
                    </div>
                    <div className="flex-1 mx-4 flex flex-col items-center">
                      <p className="text-xs text-muted-foreground mb-2">{selectedDay === 0 ? "4시간 45분" : "4시간 20분"}</p>
                      <div className="w-full h-px bg-border relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
                        <motion.div
                          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                          animate={{ left: ["30%", "70%", "30%"] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <span className="text-sm">✈️</span>
                        </motion.div>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-foreground">{selectedDay === 0 ? "DAD" : "ICN"}</p>
                      <p className="text-sm text-muted-foreground">{selectedDay === 0 ? "다낭" : "인천"}</p>
                      <p className="text-base font-bold text-primary mt-1">{selectedDay === 0 ? "12:30" : "22:05"}</p>
                    </div>
                  </div>
                </div>
                {selectedDay === 0 && (
                  <div className="mx-5 mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <p className="text-sm font-bold text-amber-800">진에어(LJ) 카운터에서 탑승수속!</p>
                    <p className="text-xs text-amber-700 mt-0.5">대한항공 코드셰어 · 터미널 2 · 예약번호 EPL***</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Parent tip */}
            <motion.div
              variants={contentVariants}
              custom={1}
              className="rounded-2xl p-4 border"
              style={{
                background: "hsl(var(--primary) / 0.06)",
                borderColor: "hsl(var(--primary) / 0.18)",
              }}
            >
              <p className="text-base font-bold text-primary mb-1">서여사 · 이서방 체크!</p>
              <p className="text-base text-foreground leading-relaxed">{day.parentTip}</p>
            </motion.div>

            {/* Timeline */}
            <motion.div variants={contentVariants} custom={1.5} className="card-base">
              <div className="flex items-center gap-2 mb-5">
                <h4 className="text-lg font-bold text-foreground">{day.date} ({day.weekday})</h4>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${locationBadge[day.location] || ""}`}>
                  {day.location}
                </span>
              </div>
              <div className="relative">
                {/* Timeline line */}
                <div
                  className="absolute left-[1.75rem] top-3 bottom-3 w-px"
                  style={{ background: "hsl(var(--border))" }}
                />
                <div className="space-y-1">
                  {day.schedule.map((item, i) => (
                    <motion.div
                      key={i}
                      variants={contentVariants}
                      custom={2 + i * 0.15}
                      className="flex gap-3 items-start relative py-2"
                    >
                      <div className="flex flex-col items-center flex-shrink-0 w-14 z-10">
                        <span className="text-xs font-bold text-primary tabular-nums">{item.time}</span>
                        <div
                          className="w-3 h-3 rounded-full mt-1 border-2"
                          style={{
                            borderColor: typeConfig[item.type]?.color || "hsl(var(--primary))",
                            background: "hsl(var(--card))",
                          }}
                        />
                      </div>
                      <div
                        className="flex-1 rounded-xl p-3 transition-colors"
                        style={{ background: "hsl(var(--secondary) / 0.4)" }}
                      >
                        <p className="text-base font-semibold text-foreground">
                          {typeConfig[item.type]?.icon} {item.activity}
                        </p>
                        {item.detail && (
                          <p className="text-sm text-muted-foreground mt-0.5">{item.detail}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Meals */}
            <motion.div
              variants={contentVariants}
              custom={3}
              className="rounded-2xl p-4 border"
              style={{
                background: "hsl(20, 85%, 97%)",
                borderColor: "hsl(20, 60%, 88%)",
              }}
            >
              <p className="text-sm font-bold mb-2" style={{ color: "hsl(20, 85%, 45%)" }}>식사 안내</p>
              {day.meals.map((m, i) => (
                <p key={i} className="text-sm text-foreground leading-relaxed">{m}</p>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TodayTab;
