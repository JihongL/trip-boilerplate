/** 빌드타임 + 런타임 공용 메타 정보 (trip.meta.json과 동일 구조) */
export interface TripMeta {
  /** PWA 앱 이름 (예: "서여사 생신기념 - 다낭 · 호이안") */
  appName: string;
  /** PWA short_name (예: "베트남 계획") */
  shortName: string;
  /** 메타 설명 */
  description: string;
  /** 테마 메인 색상 hex (예: "#E8773A") */
  themeColor: string;
  /** PWA 배경색 hex (예: "#FAF6F1") */
  backgroundColor: string;
  /** 여행 제목 (예: "서여사 생신기념 다낭 · 호이안 여행") */
  tripTitle: string;
  /** 여행 부제 (예: "2026.03.20 ~ 03.23 | 3박 4일") */
  subtitle: string;
  /** 헤더 이미지 경로 (예: "/hoian_lantern_header.webp") */
  headerImage: string;
  /** 배경 이미지 경로 (예: "/vietnam_resort_bg.webp") */
  backgroundImage: string;
  /** 국가 이모지 (예: "🇻🇳") */
  countryEmoji: string;
  /** CSS 테마 변수 (index.css :root 값) */
  cssVars: Record<string, string>;
}

export interface Rule {
  num: string;
  text: string;
}

export type ScheduleType = "flight" | "move" | "food" | "stay" | "activity";

export interface ScheduleEvent {
  time: string;
  activity: string;
  detail?: string;
  type: ScheduleType;
}

export interface DaySchedule {
  day: number;
  date: string;
  weekday: string;
  title: string;
  location: string;
  schedule: ScheduleEvent[];
  meals: string[];
  parentTip: string;
  preparation: string[];
  /** 이 날 묵는 호텔의 인덱스 (hotels 배열 기준) */
  hotelIndex?: number;
}

export interface Hotel {
  name: string;
  address: string;
  area: string;
  checkIn: string;
  checkOut: string;
  lat: number;
  lng: number;
}

export interface ChecklistItem {
  text: string;
}

export interface POI {
  emoji: string;
  name: string;
  category: string;
  area: string;
  description: string;
  why: string;
  address: string;
  visitTime: string;
  transport: string;
  familyNote: string;
  lat: number;
  lng: number;
}

export interface PlaceCategory {
  title: string;
  emoji: string;
  area: string;
  items: { name: string; tip: string }[];
}

export interface Contact {
  label: string;
  number: string;
  note?: string;
}

export interface SosConfig {
  emergency: { emoji: string; label: string; sublabel: string; number: string }[];
  consulate: { emoji: string; label: string; sublabel: string; number: string }[];
  emergencySteps: string[];
  hospitals: Contact[];
  koreanContacts: Contact[];
  hotelAirline: Contact[];
  lostPassportSteps: string[];
  hospitalVisitInfo: string[];
}

export interface ExchangeConfig {
  from: string;
  fromName: string;
  fromFlag: string;
  fromUnit: string;
  to: string;
  toName: string;
  toFlag: string;
  toUnit: string;
  fallbackRate: number;
  localPrices: { label: string; amount: number }[];
  tip: { main: string; example: string };
}

export interface WeatherLocation {
  lat: number;
  lon: number;
  city: string;
}

export interface WeatherConfig {
  locations: WeatherLocation[];
  defaultIndex: number;
}

export interface FlightInfo {
  direction: "outbound" | "inbound";
  label: string;
  airline: string;
  fromCode: string;
  fromCity: string;
  departTime: string;
  toCode: string;
  toCity: string;
  arriveTime: string;
  duration: string;
  note?: string;
  dayIndex: number;
}

export interface PledgeConfig {
  title: string;
  pledgeText: string;
  participationQuestion: string;
  acceptText: string;
  declineText: string;
  declineMessages: string[];
  introGreeting: string;
  introTitle: string;
  introDescription: string;
  rulesHeaderTitle: string;
  rulesHeaderSubtitle: string;
}

export interface PackingGuide {
  clothing: string[];
  luggage: string[];
}

export interface TripConfig {
  meta: TripMeta;
  pledge: PledgeConfig;
  rules: Rule[];
  schedule: DaySchedule[];
  hotels: Hotel[];
  flights: FlightInfo[];
  checklist: ChecklistItem[];
  packingGuide: PackingGuide;
  pois: POI[];
  placeCategories: PlaceCategory[];
  sos: SosConfig;
  exchange: ExchangeConfig;
  weather: WeatherConfig;
  tripStart: string;
  tripEnd: string;
  mapCenter: [number, number];
  mapZoom: number;
  areas: string[];
  areaBadgeColors: Record<string, { bg: string; text: string; border: string }>;
  /** 지역별 그라데이션 색상 */
  locationGradients: Record<string, { gradient: string }>;
  /** 부모님 팁 카드 라벨 */
  parentTipLabel: string;
  headerLabel: string;
  footerText: string;
}
