import type { DayOption, DaySchedule } from "@/config/types";

/** 옵션이 생략한 필드는 날짜 기본값을 그대로 상속한다. */
export function resolveDayOption(
  day: DaySchedule,
  selectedOptionId: string | null,
): { effectiveDay: DaySchedule; activeOption: DayOption | null } {
  if (!day.options || day.options.length < 2) {
    return { effectiveDay: day, activeOption: null };
  }

  const activeOption = day.options.find((option) => option.id === selectedOptionId) ?? day.options[0];
  return {
    activeOption,
    effectiveDay: {
      ...day,
      location: activeOption.location ?? day.location,
      schedule: activeOption.schedule ?? day.schedule,
      meals: activeOption.meals ?? day.meals,
      dayTip: activeOption.dayTip ?? day.dayTip,
      preparation: activeOption.preparation ?? day.preparation,
      stops: activeOption.stops ?? day.stops,
      weatherIndex: activeOption.weatherIndex ?? day.weatherIndex,
    },
  };
}
