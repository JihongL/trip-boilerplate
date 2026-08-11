/**
 * Trip Boilerplate — Config 타입 계약
 *
 * 이 파일이 모든 컴포넌트와 config 사이의 단일 계약이다.
 * 국내여행(강원도)과 해외여행(베트남·홋카이도)을 모두 지원한다.
 * 해외 전용 필드(exchange, flights, pledge, consulate 등)는 전부 옵셔널이다.
 */

// ─────────────────────────────────────────────
// 공통
// ─────────────────────────────────────────────

/**
 * 지도 위 한 지점. 모든 장소(숙소·맛집·POI·일정)가 공유한다.
 * 내비 실행과 지도 표시의 단일 소스.
 *
 * kakaoPlaceUrl / naverPlaceUrl 은 국내 여행에서 좌표보다 정확하다.
 * 지번 주소·산간 진입로처럼 지오코딩이 부정확한 곳은 반드시 채울 것.
 */
export interface Place {
  lat: number;
  lng: number;
  /**
   * 이 지점의 주소. 지도 앱이 없을 때의 웹 폴백 검색어로 쓰인다.
   * **이름이 일반명사인 장소(농막·계곡·해변 등)는 반드시 채울 것** —
   * 없으면 이름으로 검색해 엉뚱한 결과가 나온다.
   */
  address?: string;
  /** 네이버 지도 장소 URL (이 앱의 지도 표준) */
  naverPlaceUrl?: string;
  /** 카카오맵 장소 URL */
  kakaoPlaceUrl?: string;
}

/** 지원하는 내비/지도 앱. config 의 navApps 순서대로 버튼이 노출된다. */
export type NavApp =
  | "kakaonavi"
  | "tmap"
  | "kakaomap"
  | "navermap"
  | "googlemaps";

/** 정보의 검증 상태. 앱에서 배지로 구분 표시된다. */
export type VerificationStatus = "confirmed" | "needs-check";

// ─────────────────────────────────────────────
// 메타 / 테마
// ─────────────────────────────────────────────

/** 빌드타임(vite/tailwind) + 런타임 공용 메타. trip.meta.json 과 동일 구조. */
export interface TripMeta {
  /** PWA 앱 이름 */
  appName: string;
  /** PWA short_name */
  shortName: string;
  /** 메타 설명 */
  description: string;
  /** 테마 메인 색상 hex */
  themeColor: string;
  /** PWA 배경색 hex */
  backgroundColor: string;
  /** 여행 제목 */
  tripTitle: string;
  /** 여행 부제 (예: "2026.08.14 ~ 08.17 | 3박 4일") */
  subtitle: string;
  /**
   * 헤더 배경 이미지 경로. 비우면 headerGradient 를 사용한다.
   * 사진 자산이 없는 여행은 비워 둘 것.
   */
  headerImage?: string;
  /** headerImage 가 없을 때 쓰는 CSS gradient */
  headerGradient?: string;
  /** 배경 이미지 경로 (선택) */
  backgroundImage?: string;
  /** 국가/지역 이모지 */
  countryEmoji: string;
  /** CSS 테마 변수 (index.css :root 에 주입) */
  cssVars: Record<string, string>;
}

// ─────────────────────────────────────────────
// 탭
// ─────────────────────────────────────────────

export type TabId = "today" | "map" | "food" | "sos" | "exchange";

export interface TabConfig {
  id: TabId;
  label: string;
  emoji: string;
}

// ─────────────────────────────────────────────
// 인트로 (구 pledge/EntryGate 대체)
// ─────────────────────────────────────────────

/** 인트로에 띄우는 숫자 요약 한 칸 (예: 3박 4일 / 숙소 2곳) */
export interface IntroHighlight {
  emoji: string;
  label: string;
  value: string;
}

export interface IntroConfig {
  /** false 면 인트로를 건너뛰고 바로 대시보드로 진입 */
  enabled: boolean;
  title: string;
  subtitle: string;
  description?: string;
  /** 진입 버튼 문구 */
  enterText: string;
  highlights: IntroHighlight[];
  /** true 면 최초 1회만 노출, false 면 앱 열 때마다 노출 */
  onceOnly: boolean;
}

// ─────────────────────────────────────────────
// 숙소
// ─────────────────────────────────────────────

/**
 * 숙소 시설. false 인 항목은 bring(챙길 것)으로 이어진다.
 * 농막·펜션 등 비호텔 숙소를 표현하기 위해 호텔 전용 개념을 쓰지 않는다.
 */
export interface StayFacilities {
  aircon: boolean;
  toilet: boolean;
  kitchen: boolean;
  electricity: boolean;
  bedding: boolean;
  shower?: boolean;
  wifi?: boolean;
  parking?: boolean;
}

export interface Stay {
  name: string;
  address: string;
  area: string;
  place: Place;
  /** 지정 없는 숙소(농막 등)는 생략 */
  checkIn?: string;
  checkOut?: string;
  /** 오프라인에서도 반드시 보여야 하는 값 */
  phone?: string;
  facilities: StayFacilities;
  /** 시설에 없어서 직접 챙겨야 하는 것 */
  bring: string[];
  cautions: string[];
  /** 진입로 안내. 야간 도착·산간 진입 시 핵심 정보 */
  accessNote?: string;
  /** 표시용 숙박 구간 (예: "8/14 → 8/15 · 1박") */
  nights: string;
}

// ─────────────────────────────────────────────
// 맛집
// ─────────────────────────────────────────────

export type MealTime = "아침" | "점심" | "저녁" | "카페" | "야식";

/** 영업 상태 계산용 시각 정보 (HH:mm 24시간제) */
export interface OpenHours {
  open: string;
  close: string;
  breakStart?: string;
  breakEnd?: string;
}

/** 이 집을 고른 근거. 출처가 없는 추천은 넣지 않는다. */
export interface RestaurantCredentials {
  /** 예: "블루리본 2025", "미쉐린 빕구르망 2024" */
  awards?: string[];
  rating?: {
    score: number;
    count: number;
    source: "카카오맵" | "네이버" | "구글";
  };
  reservation?: {
    platform: "캐치테이블" | "테이블링" | "네이버예약" | "전화";
    /** 성수기 예약 필수 여부 */
    required: boolean;
    url?: string;
  };
}

export interface Restaurant {
  id: string;
  name: string;
  category: string;
  area: string;
  /** 대표 메뉴 */
  signature: string[];
  address: string;
  place: Place;
  /** 표시용 영업시간 문자열 */
  hours: string;
  /** 계산용 영업시간. 있으면 "영업중/브레이크타임" 배지를 계산한다. */
  openHours?: OpenHours;
  /** 표시용 휴무일 문자열 */
  closedDays: string;
  /** 계산용 휴무 요일. 0=일 … 6=토 */
  closedWeekdays?: number[];
  priceRange: string;
  credentials: RestaurantCredentials;
  /** 기본값은 "needs-check". 직접 확인·예약한 곳만 "confirmed" */
  verification: VerificationStatus;
  /** YYYY-MM-DD */
  verifiedAt?: string;
  mealTime: MealTime[];
  note?: string;
  phone?: string;
}

// ─────────────────────────────────────────────
// POI
// ─────────────────────────────────────────────

/** 성수기 혼잡도 */
export type CrowdLevel = "low" | "mid" | "high";

export interface ParkingInfo {
  available: boolean;
  fee?: string;
  note?: string;
}

export interface POI {
  emoji: string;
  name: string;
  category: string;
  area: string;
  description: string;
  why: string;
  address: string;
  place: Place;
  visitTime: string;
  openHours?: string;
  /** 입장료. 국내 당일치기 일정 성립 조건 */
  admission?: string;
  /** 자차 여행의 최대 마찰 지점 */
  parking?: ParkingInfo;
  crowdLevel?: CrowdLevel;
  /** 동행자 배려 메모 (구 familyNote) */
  companionNote?: string;
  verification?: VerificationStatus;
}

export interface PlaceCategory {
  title: string;
  emoji: string;
  area: string;
  items: { name: string; tip: string }[];
}

// ─────────────────────────────────────────────
// 일정
// ─────────────────────────────────────────────

/** placeholder = 아직 정해지지 않은 일정. 정직하게 "미정"으로 표시된다. */
export type ScheduleType =
  | "move"
  | "food"
  | "stay"
  | "activity"
  | "flight"
  | "placeholder";

export interface ScheduleEvent {
  time: string;
  activity: string;
  detail?: string;
  type: ScheduleType;
  /** 있으면 항목에서 바로 내비 실행 가능 */
  place?: Place;
  /** 예: "약 2시간 40분" */
  durationNote?: string;
}

/** 그날 이동경로 지도에 찍히는 정류점 */
export interface RouteStop {
  name: string;
  emoji: string;
  lat: number;
  lng: number;
}

export interface DaySchedule {
  day: number;
  date: string;
  weekday: string;
  title: string;
  location: string;
  /** stays 배열 인덱스. 그날 묵는 숙소 */
  stayIndex?: number;
  schedule: ScheduleEvent[];
  meals: string[];
  /** 구 parentTip. 라벨은 dayTipLabel 로 지정 */
  dayTip: string;
  preparation: string[];
  /** 이동경로 지도용. 없으면 지도 생략 */
  stops?: RouteStop[];
  /** weather.locations 인덱스. 그날 기준 지점 */
  weatherIndex?: number;
}

export interface ChecklistItem {
  text: string;
}

export interface PackingGuide {
  clothing: string[];
  luggage: string[];
}

// ─────────────────────────────────────────────
// SOS
// ─────────────────────────────────────────────

export interface Contact {
  label: string;
  number: string;
  note?: string;
}

export interface EmergencyEntry {
  emoji: string;
  label: string;
  sublabel: string;
  number: string;
}

export interface SosConfig {
  emergency: EmergencyEntry[];
  emergencySteps: string[];
  hospitals: Contact[];
  /** 도로공사·보험·견인 등 자차 여행용 */
  roadside: Contact[];
  /** 숙소 연락처. 오프라인에서도 반드시 노출된다. */
  stayContacts: Contact[];
  /** ↓ 해외 전용 (옵셔널) */
  consulate?: EmergencyEntry[];
  lostPassportSteps?: string[];
  hospitalVisitInfo?: string[];
}

// ─────────────────────────────────────────────
// 날씨
// ─────────────────────────────────────────────

export interface WeatherLocation {
  lat: number;
  lon: number;
  city: string;
  /** 화면 표기용 짧은 라벨 (예: "양양 산간") */
  label?: string;
}

export interface WeatherConfig {
  locations: WeatherLocation[];
  defaultIndex: number;
}

// ─────────────────────────────────────────────
// 해외 전용 (옵셔널)
// ─────────────────────────────────────────────

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

export interface Rule {
  num: string;
  text: string;
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

// ─────────────────────────────────────────────
// 루트
// ─────────────────────────────────────────────

export interface AreaBadgeColor {
  bg: string;
  text: string;
  border: string;
}

export interface TripConfig {
  meta: TripMeta;

  /** 노출할 탭과 순서. 최대 4개 권장 (하단 네비 UX) */
  tabs: TabConfig[];
  /** 내비 버튼에 노출할 앱과 순서 */
  navApps: NavApp[];

  intro: IntroConfig;
  schedule: DaySchedule[];
  stays: Stay[];
  restaurants: Restaurant[];
  pois: POI[];
  placeCategories: PlaceCategory[];
  checklist: ChecklistItem[];
  packingGuide: PackingGuide;
  sos: SosConfig;
  weather: WeatherConfig;

  /** ISO8601 with offset */
  tripStart: string;
  tripEnd: string;

  mapCenter: [number, number];
  mapZoom: number;
  areas: string[];
  areaBadgeColors: Record<string, AreaBadgeColor>;
  locationGradients: Record<string, { gradient: string }>;

  /** dayTip 카드의 라벨 (예: "오늘의 팁") */
  dayTipLabel: string;
  headerLabel: string;
  footerText: string;

  /** ↓ 해외 전용 (옵셔널) */
  exchange?: ExchangeConfig;
  flights?: FlightInfo[];
  rules?: Rule[];
  pledge?: PledgeConfig;
}
