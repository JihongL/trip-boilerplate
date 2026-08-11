import { useQuery } from "@tanstack/react-query";
import { tripConfig } from "@/config/trip";

/**
 * 국내(강원도) 자차 여행용 날씨 훅.
 *
 * 양양 갈천리 · 평창 진부면은 산간이라 통신이 끊길 수 있어 재시도를 최소화하고
 * (retry: 1) staleTime 을 넉넉히(30분) 잡아 배터리를 아낀다.
 * API 키가 없거나 네트워크가 실패해도 절대 예외를 던지지 않고 error:true 로 조용히 반환한다.
 */

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY as string | undefined;

export interface WeatherResult {
  loading: boolean;
  error: boolean;
  current?: { temp: number; description: string; icon: string; feelsLike?: number };
  daily?: { date: string; min: number; max: number; description: string; icon: string; pop?: number }[];
  alerts?: { event: string; description?: string }[];
}

const WEATHER_ICON_MAP: Record<string, string> = {
  "01d": "☀️", "01n": "🌙",
  "02d": "🌤️", "02n": "☁️",
  "03d": "⛅", "03n": "⛅",
  "04d": "☁️", "04n": "☁️",
  "09d": "🌧️", "09n": "🌧️",
  "10d": "🌦️", "10n": "🌧️",
  "11d": "⛈️", "11n": "⛈️",
  "13d": "❄️", "13n": "❄️",
  "50d": "🌫️", "50n": "🌫️",
};

function getWeatherEmoji(iconCode: string): string {
  return WEATHER_ICON_MAP[iconCode] || "🌤️";
}

/** UTC epoch(초) → Asia/Seoul 기준 YYYY-MM-DD. 일정(schedule)의 date 와 매칭하기 위함. */
function toSeoulDateKey(dtSeconds: number): string {
  return new Date(dtSeconds * 1000).toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
}

interface OwmWeatherEntry {
  description: string;
  icon: string;
}

interface OwmCurrentResponse {
  main: { temp: number; feels_like: number };
  weather: OwmWeatherEntry[];
}

interface OwmForecastItem {
  dt: number;
  main: { temp: number };
  weather: OwmWeatherEntry[];
  pop?: number;
}

interface OwmForecastResponse {
  list: OwmForecastItem[];
}

interface FetchedWeather {
  current: NonNullable<WeatherResult["current"]>;
  daily: NonNullable<WeatherResult["daily"]>;
}

const WEATHER_REQUEST_TIMEOUT_MS = 10_000;

async function fetchTripWeather(lat: number, lon: number): Promise<FetchedWeather> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), WEATHER_REQUEST_TIMEOUT_MS);
  let currentRes: Response;
  let forecastRes: Response;
  try {
    [currentRes, forecastRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`, { signal: controller.signal }),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`, { signal: controller.signal }),
    ]);
  } finally {
    window.clearTimeout(timeout);
  }

  if (!currentRes.ok || !forecastRes.ok) {
    throw new Error("날씨 데이터를 가져올 수 없습니다");
  }

  const currentData: OwmCurrentResponse = await currentRes.json();
  const forecastData: OwmForecastResponse = await forecastRes.json();

  const current: FetchedWeather["current"] = {
    temp: Math.round(currentData.main.temp),
    feelsLike: Math.round(currentData.main.feels_like),
    description: currentData.weather[0]?.description ?? "",
    icon: getWeatherEmoji(currentData.weather[0]?.icon ?? ""),
  };

  // 3시간 간격 예보를 Asia/Seoul 기준 날짜별로 묶는다.
  const byDate = new Map<string, OwmForecastItem[]>();
  for (const item of forecastData.list ?? []) {
    const key = toSeoulDateKey(item.dt);
    const bucket = byDate.get(key);
    if (bucket) bucket.push(item);
    else byDate.set(key, [item]);
  }

  const daily: FetchedWeather["daily"] = Array.from(byDate.entries()).map(([date, items]) => {
    const temps = items.map((i) => i.main.temp);
    const pops = items.map((i) => i.pop ?? 0);
    // 낮 시간대(아이콘이 'd'로 끝남) 항목을 대표값으로 우선 사용
    const daytime = items.filter((i) => i.weather[0]?.icon?.endsWith("d"));
    const representative = daytime.length > 0 ? daytime[Math.floor(daytime.length / 2)] : items[Math.floor(items.length / 2)];

    return {
      date,
      min: Math.round(Math.min(...temps)),
      max: Math.round(Math.max(...temps)),
      description: representative?.weather[0]?.description ?? "",
      icon: getWeatherEmoji(representative?.weather[0]?.icon ?? ""),
      pop: Math.round(Math.max(...pops) * 100),
    };
  });

  return { current, daily };
}

export function useTripWeather(locationIndex: number): WeatherResult {
  const locations = tripConfig.weather.locations ?? [];
  const defaultIndex =
    tripConfig.weather.defaultIndex >= 0 && tripConfig.weather.defaultIndex < locations.length
      ? tripConfig.weather.defaultIndex
      : 0;
  const safeIndex =
    Number.isInteger(locationIndex) && locationIndex >= 0 && locationIndex < locations.length
      ? locationIndex
      : defaultIndex;
  const loc = locations[safeIndex];

  const query = useQuery({
    queryKey: ["trip-weather", loc?.lat, loc?.lon],
    queryFn: () => fetchTripWeather(loc.lat, loc.lon),
    enabled: !!API_KEY && !!loc,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // API 키가 없거나 (배포 시 누락 가능) 지점 정보가 아예 없으면 조용히 에러로 반환 — 크래시 금지.
  if (!API_KEY || !loc) {
    return { loading: false, error: true };
  }

  return {
    loading: query.isLoading,
    error: query.isError,
    current: query.data?.current,
    daily: query.data?.daily,
    // alerts: OpenWeatherMap 무료 플랜(2.5 API)은 기상특보를 제공하지 않아 항상 생략한다.
  };
}
