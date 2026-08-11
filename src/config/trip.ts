import type { TripConfig } from "./types";
import meta from "./trip.meta.json";
import { stays, weatherLocations, ORIGIN, STOP } from "./places";
import { restaurants } from "./restaurants";
import { pois } from "./pois";
import { hospitals, roadside, stayContacts } from "./places";

/**
 * 2026 강원도 여름휴가 · 3박 4일 · 2명 · 자차
 *
 * 장소 좌표·맛집·POI·병원 데이터는 places.ts / restaurants.ts / pois.ts 로 분리되어 있다.
 * 이 파일은 여행의 뼈대(일정·인트로·탭·준비물)만 담는다.
 */
export const tripConfig: TripConfig = {
  meta: meta satisfies TripConfig["meta"],

  tabs: [
    { id: "today", label: "오늘", emoji: "📋" },
    { id: "map", label: "지도", emoji: "🗺️" },
    { id: "food", label: "맛집", emoji: "🍽️" },
    { id: "sos", label: "SOS", emoji: "🚨" },
  ],

  /**
   * 지도 표준은 **네이버 지도**. 카카오는 맛집 평점 출처로만 쓰고 지도 연동에는 쓰지 않는다.
   * T맵은 자차 실시간 교통 대안으로 함께 둔다.
   * googlemaps 는 한국에서 자동차 길찾기를 제공하지 않아(지도 데이터 반출 제한) 제외.
   */
  navApps: ["navermap", "tmap"],

  tripStart: "2026-08-14T00:00:00+09:00",
  tripEnd: "2026-08-17T23:59:59+09:00",

  mapCenter: [37.72, 128.55],
  mapZoom: 9,

  areas: ["양양", "강릉", "평창"],
  areaBadgeColors: {
    // 테마 토큰 기반 — 다크모드에서도 대비가 유지된다 (index.css 의 .area-badge-* 참고)
    "양양": { bg: "area-badge-ocean", text: "", border: "" },
    "강릉": { bg: "area-badge-sky", text: "", border: "" },
    "평창": { bg: "area-badge-pine", text: "", border: "" },
  },
  locationGradients: {
    "양양": { gradient: "linear-gradient(135deg, hsl(202, 68%, 42%) 0%, hsl(200, 70%, 55%) 100%)" },
    "강릉": { gradient: "linear-gradient(135deg, hsl(192, 65%, 40%) 0%, hsl(200, 70%, 58%) 100%)" },
    "평창": { gradient: "linear-gradient(135deg, hsl(157, 34%, 30%) 0%, hsl(157, 30%, 45%) 100%)" },
  },

  dayTipLabel: "오늘의 팁",
  headerLabel: "2026 강원도 여름휴가",
  footerText: "jihong.lee@outlook.com",

  intro: {
    enabled: true,
    onceOnly: true,
    title: "2026 강원도 여름휴가",
    subtitle: "양양 · 강릉 · 평창",
    description: "바다와 소나무, 3박 4일",
    enterText: "여행 시작하기",
    highlights: [
      { emoji: "📅", label: "일정", value: "3박 4일" },
      { emoji: "🏡", label: "숙소", value: "2곳" },
      { emoji: "🚗", label: "이동", value: "자차" },
      { emoji: "🌊", label: "지역", value: "양양 · 강릉 · 평창" },
    ],
  },

  stays,
  restaurants,
  pois,
  weather: {
    locations: weatherLocations,
    defaultIndex: 0,
  },

  schedule: [
    {
      day: 1,
      date: "8월 14일",
      weekday: "금",
      title: "출발 & 양양 도착",
      location: "양양",
      stayIndex: 0,
      weatherIndex: 0,
      schedule: [
        { time: "20:00", activity: "증산역 출발", detail: "서울 은평구", type: "move", place: ORIGIN.place },
        { time: "20:00", activity: "양양 갈천리로 이동", detail: "약 190km", type: "move", durationNote: "약 2시간 40분" },
        { time: "23:00", activity: "농막 도착 & 짐 정리", detail: "야간 산길 · 진입로 주의", type: "stay", place: stays[0].place },
      ],
      meals: ["저녁: 출발 전 또는 휴게소"],
      dayTip:
        "금요일 정체 피크는 15~19시입니다. 20시 출발이면 상당 부분 풀린 뒤라 오히려 유리해요. 대신 도착이 23시 전후 야간이고 갈천리는 산간이라 가로등이 없습니다. 진입로를 미리 확인하고 헤드랜턴을 손 닿는 곳에 두세요.",
      preparation: [
        "헤드랜턴 또는 손전등 (야간 진입 필수)",
        "숙소 진입로 미리 확인 · 스크린샷 저장",
        "차량 연료 · 통행료 결제 수단",
        "모기기피제",
        "간단한 야식 · 물",
      ],
      stops: [ORIGIN.stop, STOP.yangyangStay],
    },
    {
      day: 2,
      date: "8월 15일",
      weekday: "토",
      title: "양양 바다 & 평창 이동",
      location: "양양",
      stayIndex: 1,
      weatherIndex: 0,
      schedule: [
        { time: "오전", activity: "양양 해변 · 물놀이", detail: "미정 — 날씨 보고 결정", type: "placeholder" },
        { time: "점심", activity: "양양 점심", detail: "미정 — 맛집 탭에서 선택", type: "placeholder" },
        { time: "오후", activity: "평창으로 이동", type: "move", durationNote: "약 1시간 30분" },
        { time: "15:00", activity: "서림원 체크인", type: "stay", place: stays[1].place },
        { time: "저녁", activity: "평창 저녁", detail: "미정 — 맛집 탭에서 선택", type: "placeholder" },
      ],
      meals: ["아침: 농막에서 간단히", "점심: 양양", "저녁: 평창"],
      dayTip:
        "광복절이라 해변이 붐빕니다. 오전 일찍 움직이면 주차가 편해요. 서림원 체크인이 15시니 그 전에 양양 일정을 마치고 이동하는 게 여유롭습니다.",
      preparation: ["수영복 · 방수팩", "선크림 · 모자", "여벌 옷 · 수건", "농막 짐 정리 (체크아웃 시각 없음)"],
      stops: [STOP.yangyangStay, STOP.yangyangBeach, STOP.pyeongchangStay],
    },
    {
      day: 3,
      date: "8월 16일",
      weekday: "일",
      title: "강릉 나들이",
      location: "강릉",
      stayIndex: 1,
      weatherIndex: 1,
      schedule: [
        { time: "오전", activity: "강릉으로 이동", type: "move", durationNote: "약 1시간" },
        { time: "오전", activity: "강릉 관광", detail: "미정 — 커피거리 · 해변 등", type: "placeholder" },
        { time: "점심", activity: "강릉 점심", detail: "미정 — 맛집 탭에서 선택", type: "placeholder" },
        { time: "오후", activity: "강릉 자유 일정", type: "placeholder" },
        { time: "저녁", activity: "평창 복귀", type: "move", durationNote: "약 1시간" },
      ],
      meals: ["아침: 서림원", "점심: 강릉", "저녁: 강릉 또는 평창"],
      dayTip:
        "평창 숙소에서 강릉까지 왕복이라 이동 시간이 하루에 2시간쯤 듭니다. 강릉에서 몰아서 보고 저녁까지 먹고 돌아오는 편이 효율적이에요.",
      preparation: ["차량 연료 확인", "주차 요금 현금/카드", "양산 또는 우산"],
      stops: [STOP.pyeongchangStay, STOP.gangneung, STOP.pyeongchangStay],
    },
    {
      day: 4,
      date: "8월 17일",
      weekday: "월",
      title: "체크아웃 & 귀가",
      location: "평창",
      weatherIndex: 2,
      schedule: [
        { time: "오전", activity: "짐 정리", type: "stay" },
        { time: "11:00", activity: "서림원 체크아웃", type: "stay", place: stays[1].place },
        { time: "오후", activity: "귀가", detail: "대체공휴일 — 오후 상행선 정체", type: "move", durationNote: "평시 2시간 40분 · 정체 시 3~5시간" },
      ],
      meals: ["아침: 서림원", "점심: 이동 중"],
      dayTip:
        "8/17은 광복절 대체공휴일이라 오후 상행선이 막힙니다. 일찍 출발하거나, 반대로 저녁까지 놀다 늦게 움직이는 쪽이 나아요.",
      preparation: ["숙소 두고 온 물건 확인", "쓰레기 정리", "차량 연료"],
      stops: [STOP.pyeongchangStay, ORIGIN.stop],
    },
  ],

  checklist: [
    { text: "숙소 예약 확인서 (농막 · 서림원)" },
    { text: "숙소 진입로 · 좌표 스크린샷 저장" },
    { text: "차량 점검 (타이어 · 워셔액 · 연료)" },
    { text: "하이패스 잔액 확인" },
    { text: "차량용 충전기 · 보조배터리" },
    { text: "헤드랜턴 / 손전등" },
    { text: "수영복 · 방수팩 · 수건" },
    { text: "선크림 · 모자 · 선글라스" },
    { text: "모기기피제 · 상비약" },
    { text: "우산 또는 우비 (8월 소나기)" },
    { text: "농막 식재료 · 생수" },
    { text: "쓰레기봉투" },
  ],

  packingGuide: {
    clothing: [
      "낮: 반팔 · 반바지 (8월 평균 27~31°C)",
      "산간 야간: 얇은 긴팔 하나 (갈천리·평창은 밤에 선선함)",
      "물놀이용 래시가드 또는 수영복",
      "샌들 + 운동화 (계곡·해변·산길 모두 대응)",
      "여벌 옷 넉넉히 (땀 · 물놀이)",
    ],
    luggage: [
      "자차라 무게 제한 없음 — 아이스박스 활용",
      "농막 취사 가능 → 식재료 · 조미료 챙기면 절약",
      "젖은 옷 담을 방수 가방",
      "돗자리 또는 캠핑 의자",
      "쓰레기 되가져오기용 봉투",
    ],
  },

  placeCategories: [
    {
      title: "양양",
      emoji: "🏄",
      area: "양양",
      items: [
        { name: "서핑 해변", tip: "죽도 · 인구 해변이 서핑 중심지" },
        { name: "물회", tip: "양양 대표 여름 음식" },
        { name: "낙산사", tip: "일출과 바다 전망" },
      ],
    },
    {
      title: "강릉",
      emoji: "☕",
      area: "강릉",
      items: [
        { name: "안목 커피거리", tip: "바다 보며 커피. 주차 혼잡 주의" },
        { name: "초당순두부", tip: "강릉 대표 음식. 오전에 가면 웨이팅 적음" },
        { name: "경포 · 안목 해변", tip: "8월 개장 기간 확인" },
      ],
    },
    {
      title: "평창",
      emoji: "🌲",
      area: "평창",
      items: [
        { name: "대관령", tip: "여름에도 선선. 목장 · 전망" },
        { name: "계곡", tip: "8월 호우 시 수위 급상승 주의" },
        { name: "메밀 음식", tip: "봉평 메밀국수 · 전병" },
      ],
    },
  ],

  sos: {
    emergency: [
      { emoji: "🚑", label: "119", sublabel: "화재 · 구급 · 산악사고", number: "119" },
      { emoji: "🚔", label: "112", sublabel: "경찰 신고", number: "112" },
    ],
    emergencySteps: [
      "안전한 곳으로 이동 (갓길·비탈 주의)",
      "119 또는 112로 신고",
      "현재 위치를 정확히 전달 — 지도 앱의 좌표 공유 사용",
      "숙소에 연락 (산간은 숙소가 가장 빠른 도움)",
      "차량 사고 시 보험사 긴급출동 접수",
    ],
    hospitals,
    roadside,
    stayContacts,
  },
};
