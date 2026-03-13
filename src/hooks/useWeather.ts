import { useQuery } from "@tanstack/react-query";
import { tripConfig } from "@/config/trip";

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

interface WeatherData {
  temp: number;
  feels_like: number;
  humidity: number;
  description: string;
  icon: string;
  wind_speed: number;
  city: string;
}

interface ForecastDay {
  date: string;
  high: number;
  low: number;
  humidity: number;
  rain: number;
  description: string;
  icon: string;
}

export interface WeatherResult {
  current: WeatherData;
  forecast: ForecastDay[];
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

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

async function fetchWeather(lat: number, lon: number, city: string): Promise<WeatherResult> {
  const [currentRes, forecastRes] = await Promise.all([
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`),
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`),
  ]);

  if (!currentRes.ok || !forecastRes.ok) {
    throw new Error("날씨 데이터를 가져올 수 없습니다");
  }

  const currentData = await currentRes.json();
  const forecastData = await forecastRes.json();

  const current: WeatherData = {
    temp: Math.round(currentData.main.temp),
    feels_like: Math.round(currentData.main.feels_like),
    humidity: currentData.main.humidity,
    description: currentData.weather[0].description,
    icon: getWeatherEmoji(currentData.weather[0].icon),
    wind_speed: Math.round(currentData.wind.speed * 10) / 10,
    city,
  };

  // Group forecast by day (API returns 3-hour intervals)
  const dailyMap = new Map<string, { temps: number[]; humidities: number[]; rains: number[]; icons: string[]; descs: string[] }>();

  for (const item of forecastData.list) {
    const date = new Date(item.dt * 1000);
    const key = `${date.getMonth() + 1}/${date.getDate()}`;
    if (!dailyMap.has(key)) {
      dailyMap.set(key, { temps: [], humidities: [], rains: [], icons: [], descs: [] });
    }
    const day = dailyMap.get(key)!;
    day.temps.push(item.main.temp);
    day.humidities.push(item.main.humidity);
    day.rains.push((item.pop || 0) * 100);
    day.icons.push(item.weather[0].icon);
    day.descs.push(item.weather[0].description);
  }

  const forecast: ForecastDay[] = [];
  dailyMap.forEach((val, key) => {
    const [month, day] = key.split("/").map(Number);
    const dateObj = new Date();
    dateObj.setMonth(month - 1);
    dateObj.setDate(day);
    const dayName = DAY_NAMES[dateObj.getDay()];

    // Pick the most common daytime icon
    const daytimeIcons = val.icons.filter(i => i.endsWith("d"));
    const iconToUse = daytimeIcons.length > 0 ? daytimeIcons[Math.floor(daytimeIcons.length / 2)] : val.icons[0];

    forecast.push({
      date: `${key} (${dayName})`,
      high: Math.round(Math.max(...val.temps)),
      low: Math.round(Math.min(...val.temps)),
      humidity: Math.round(val.humidities.reduce((a, b) => a + b, 0) / val.humidities.length),
      rain: Math.round(Math.max(...val.rains)),
      description: val.descs[Math.floor(val.descs.length / 2)],
      icon: getWeatherEmoji(iconToUse),
    });
  });

  return { current, forecast: forecast.slice(0, 5) };
}

export function useWeather(locationIndex = tripConfig.weather.defaultIndex) {
  const locations = tripConfig.weather.locations;
  const loc = locations[Math.min(locationIndex, locations.length - 1)];
  return useQuery({
    queryKey: ["weather", loc.city],
    queryFn: () => fetchWeather(loc.lat, loc.lon, loc.city),
    staleTime: 30 * 60 * 1000,
    retry: 1,
    enabled: !!API_KEY,
  });
}

