import { useState, useMemo } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useWeather } from "@/hooks/useWeather";
import { tripConfig } from "@/config/trip";

const TRIP_START = new Date(tripConfig.tripStart);
const TRIP_END = new Date(tripConfig.tripEnd);

type TripPhase = "before" | "during" | "after";

const days = tripConfig.schedule;

const typeConfig: Record<string, { icon: string; color: string }> = {
  flight: { icon: "✈️", color: "hsl(210, 70%, 50%)" },
  move: { icon: "🚗", color: "hsl(280, 50%, 50%)" },
  food: { icon: "🍽️", color: "hsl(20, 85%, 55%)" },
  stay: { icon: "🏨", color: "hsl(170, 40%, 45%)" },
  activity: { icon: "🎯", color: "hsl(45, 90%, 50%)" },
};

const locationBadge: Record<string, string> = Object.fromEntries(
  Object.entries(tripConfig.areaBadgeColors).map(([area, c]) => [
    area,
    `${c.bg} ${c.text} ${c.border}`,
  ])
);

const contentVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

const checklistItems = tripConfig.checklist.map((c) => c.text);
const hotels = tripConfig.hotels;
const flights = tripConfig.flights;

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

  const { data: weather } = useWeather();

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
                {tripConfig.areas.join(" · ")}
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
                {tripConfig.meta.subtitle}
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
              background: tripConfig.locationGradients[day.location]?.gradient
                || "linear-gradient(135deg, hsl(200, 70%, 48%) 0%, hsl(210, 80%, 55%) 100%)",
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
            <p className="text-white/80 text-sm mt-1">{tripConfig.areas.join(" · ")} 우리 여행 완료</p>
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
            <p className="text-sm font-semibold text-foreground">{tripConfig.weather.locations[0].city} 현재 날씨</p>
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
                  {Object.values(checklist).filter(Boolean).length} / {checklistItems.length}
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 bg-secondary rounded-full mb-4 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "hsl(var(--primary))" }}
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(Object.values(checklist).filter(Boolean).length / checklistItems.length) * 100}%`,
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <div className="space-y-1">
                {checklistItems.map((item, i) => {
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
                    {tripConfig.packingGuide.clothing.map((item, i) => (
                      <li key={i}>· {item}</li>
                    ))}
                  </ul>
                </div>
                <div className="border-t border-border pt-3">
                  <p className="text-sm font-bold text-primary mb-1.5">🧳 캐리어</p>
                  <ul className="space-y-1.5 text-base text-foreground">
                    {tripConfig.packingGuide.luggage.map((item, i) => (
                      <li key={i}>· {item}</li>
                    ))}
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
                        className={`text-xs font-bold px-2 py-0.5 rounded-md border ${locationBadge[d.location] || ""}`}
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
              {hotels.map((hotel, hi) => (
                <div key={hi} className="card-base">
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: hi === 0 ? "hsl(35, 80%, 92%)" : "hsl(210, 70%, 93%)" }}
                    >
                      <span className="text-xl">🏨</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-foreground">{hotel.name}</p>
                      <p className="text-sm text-muted-foreground">{hotel.address}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${locationBadge[hotel.area] || ""}`}>
                      {hotel.area}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl p-3 text-center" style={{ background: "hsl(var(--secondary) / 0.5)" }}>
                      <p className="text-xs text-muted-foreground mb-0.5">체크인</p>
                      <p className="text-sm font-bold text-primary">{hotel.checkIn}</p>
                    </div>
                    <div className="rounded-xl p-3 text-center" style={{ background: "hsl(var(--secondary) / 0.5)" }}>
                      <p className="text-xs text-muted-foreground mb-0.5">체크아웃</p>
                      <p className="text-sm font-bold text-foreground">{hotel.checkOut}</p>
                    </div>
                  </div>
                </div>
              ))}
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
            {phase === "during" && day.hotelIndex != null && (
              <motion.div variants={contentVariants} custom={0} className="card-base flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "hsl(var(--secondary) / 0.5)" }}>
                  <span className="text-xl">🏨</span>
                </div>
                <div className="flex-1">
                  <p className="text-base font-bold text-foreground">{hotels[day.hotelIndex].name}</p>
                  <p className="text-sm text-muted-foreground">{hotels[day.hotelIndex].address}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${locationBadge[hotels[day.hotelIndex].area] || ""}`}>
                  {hotels[day.hotelIndex].area}
                </span>
              </motion.div>
            )}

            {/* Flight info */}
            {flights.filter((f) => f.dayIndex === selectedDay).map((flight) => (
              <motion.div
                key={flight.direction}
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
                    background: flight.direction === "outbound"
                      ? "linear-gradient(135deg, hsl(210, 70%, 50%), hsl(210, 80%, 58%))"
                      : "linear-gradient(135deg, hsl(20, 85%, 55%), hsl(35, 90%, 58%))",
                  }}
                >
                  <span className="text-sm font-bold text-white">
                    {flight.label}
                  </span>
                  <span className="text-sm text-white/80">
                    {flight.airline}
                  </span>
                </div>
                <div className="px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-foreground">{flight.fromCode}</p>
                      <p className="text-sm text-muted-foreground">{flight.fromCity}</p>
                      <p className="text-base font-bold text-primary mt-1">{flight.departTime}</p>
                    </div>
                    <div className="flex-1 mx-4 flex flex-col items-center">
                      <p className="text-xs text-muted-foreground mb-2">{flight.duration}</p>
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
                      <p className="text-2xl font-bold text-foreground">{flight.toCode}</p>
                      <p className="text-sm text-muted-foreground">{flight.toCity}</p>
                      <p className="text-base font-bold text-primary mt-1">{flight.arriveTime}</p>
                    </div>
                  </div>
                </div>
                {flight.note && (
                  <div className="mx-5 mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <p className="text-sm font-bold text-amber-800">{flight.note.split("·")[0].trim()}</p>
                    <p className="text-xs text-amber-700 mt-0.5">{flight.note}</p>
                  </div>
                )}
              </motion.div>
            ))}

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
              <p className="text-base font-bold text-primary mb-1">{tripConfig.parentTipLabel}</p>
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
