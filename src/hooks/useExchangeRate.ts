import { useQuery } from "@tanstack/react-query";
import { tripConfig } from "@/config/trip";

interface ExchangeRateData {
  rate: number;
  updatedAt: string;
  isFallback: boolean;
}

/**
 * exchange 는 해외여행 전용 옵셔널 필드다. 국내여행 config 에는 없다.
 * 모듈 최상위에서 구조분해하면 config 에 exchange 가 없는 순간 import 시점에
 * TypeError 가 터져 앱 전체가 흰 화면이 된다 — 반드시 함수 안에서 가드할 것.
 */
const FETCH_TIMEOUT = 5000;

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchRate(from: string, to: string): Promise<ExchangeRateData> {
  const urls = [
    `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${from}.min.json`,
    `https://latest.currency-api.pages.dev/v1/currencies/${from}.min.json`,
  ];
  for (const url of urls) {
    try {
      const res = await fetchWithTimeout(url, FETCH_TIMEOUT);
      if (!res.ok) continue;
      const data = await res.json();
      const rate = data?.[from]?.[to];
      const date = data?.date; // API returns "YYYY-MM-DD"
      if (typeof rate === "number" && rate > 0) {
        return {
          rate: Math.round(rate * 100) / 100,
          updatedAt: date || new Date().toISOString().slice(0, 10),
          isFallback: false,
        };
      }
    } catch {
      continue;
    }
  }
  throw new Error("Exchange rate API unavailable");
}

export function useExchangeRate() {
  const exchange = tripConfig.exchange;
  return useQuery({
    queryKey: ["exchange-rate", exchange?.from, exchange?.to],
    queryFn: () => fetchRate(exchange!.from, exchange!.to),
    enabled: !!exchange,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    retry: 2,
    placeholderData: exchange
      ? { rate: exchange.fallbackRate, updatedAt: "", isFallback: true }
      : undefined,
  });
}
