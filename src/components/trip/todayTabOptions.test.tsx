import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { DaySchedule } from "@/config/types";

vi.mock("@/hooks/useWeather", () => ({
  useTripWeather: () => ({ loading: false, error: true }),
}));

vi.mock("@/hooks/useOnline", () => ({
  useOnline: () => false,
}));

vi.mock("react-leaflet", () => ({
  MapContainer: () => null,
  TileLayer: () => null,
  Marker: () => null,
  Polyline: () => null,
}));

vi.mock("leaflet", () => {
  class DefaultIcon {}
  return {
    default: {
      Icon: { Default: DefaultIcon },
      divIcon: vi.fn(),
      latLngBounds: vi.fn(),
    },
  };
});

import TodayTab from "@/components/trip/TodayTab";
import { resolveDayOption } from "@/lib/dayOptions";

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.useRealTimers();
});

describe("일정 옵션 상속", () => {
  it("옵션에서 생략한 모든 유효 필드를 날짜 기본값에서 가져온다", () => {
    const day: DaySchedule = {
      day: 1,
      date: "8월 14일",
      weekday: "금",
      title: "테스트 일정",
      location: "양양",
      weatherIndex: 1,
      schedule: [{ time: "10:00", activity: "기본 일정", type: "activity" }],
      meals: ["기본 식사"],
      dayTip: "기본 팁",
      preparation: ["기본 준비물"],
      stops: [{ name: "기본 경유지", emoji: "📍", lat: 37, lng: 128 }],
      options: [
        { id: "inherit", emoji: "🌊", label: "상속 안", subtitle: "기본값 사용" },
        { id: "override", emoji: "🌲", label: "변경 안", subtitle: "지역만 변경", location: "평창" },
      ],
    };

    const { activeOption, effectiveDay } = resolveDayOption(day, "inherit");

    expect(activeOption?.id).toBe("inherit");
    expect(effectiveDay).toMatchObject({
      location: day.location,
      weatherIndex: day.weatherIndex,
      dayTip: day.dayTip,
    });
    expect(effectiveDay.schedule).toBe(day.schedule);
    expect(effectiveDay.meals).toBe(day.meals);
    expect(effectiveDay.preparation).toBe(day.preparation);
    expect(effectiveDay.stops).toBe(day.stops);
  });
});

describe("일정 옵션 선택", () => {
  it("날짜를 변경하면 해당 날짜의 첫 옵션으로 초기화한다", () => {
    render(<TodayTab />);

    fireEvent.click(screen.getByRole("button", { name: /토요일 8\/15/ }));
    const sungeut = screen.getByRole("radio", { name: /순긋해변 \(강릉\) 선택/ });
    fireEvent.click(sungeut);
    expect(sungeut).toHaveAttribute("aria-checked", "true");

    fireEvent.click(screen.getByRole("button", { name: /금요일 8\/14/ }));
    fireEvent.click(screen.getByRole("button", { name: /토요일 8\/15/ }));
    expect(screen.getByRole("radio", { name: /광나루해변 \(양양\) 선택/ })).toHaveAttribute("aria-checked", "true");

    fireEvent.click(screen.getByRole("radio", { name: /순긋해변 \(강릉\) 선택/ }));
    fireEvent.click(screen.getByRole("button", { name: /일요일 8\/16/ }));
    expect(screen.getByRole("radio", { name: /A 바다 \(강릉\) 선택/ })).toHaveAttribute("aria-checked", "true");
    fireEvent.click(screen.getByRole("radio", { name: /D 진부·대관령/ }));

    fireEvent.click(screen.getByRole("button", { name: /토요일 8\/15/ }));
    expect(screen.getByRole("radio", { name: /광나루해변 \(양양\) 선택/ })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: /순긋해변 \(강릉\) 선택/ })).toHaveAttribute("aria-checked", "false");
  });
});

describe("오늘 탭 정보 위계", () => {
  it("출발 전 준비와 숙소 상세 정보를 저장된 진행률과 함께 기본으로 접는다", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-11T12:00:00+09:00"));
    localStorage.setItem(
      "trip-checklist",
      JSON.stringify({
        "숙소 예약 확인서 (농막 · 서림원)": true,
        "숙소 진입로 · 좌표 스크린샷 저장": true,
        "차량 점검 (타이어 · 워셔액 · 연료)": true,
      }),
    );

    render(<TodayTab />);

    expect(screen.getByRole("button", { name: /출발 전 체크리스트 3\/12/ })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: "옷차림 · 짐" })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: "숙소 상세 정보" })).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByLabelText("숙소 예약 확인서 (농막 · 서림원)")).not.toBeInTheDocument();
    expect(screen.queryByText("헤드랜턴 또는 손전등", { exact: true })).not.toBeInTheDocument();
  });

  it("숙박일에는 날짜 헤더에 숙소 요약을 표시하고 귀가일에는 표시하지 않는다", async () => {
    render(<TodayTab />);

    expect(screen.getByText("🏡 농막 · 1박")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /월요일 8\/17/ }));

    await waitFor(() => expect(screen.queryByText(/🏡 .* · \d+박/)).not.toBeInTheDocument());
  });
});
