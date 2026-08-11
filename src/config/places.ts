import type { Stay, WeatherLocation, Place, RouteStop, Contact } from "./types";

/** 장소·좌표·연락처 데이터. */

// ─────────────────────────────────────────────
// 숙소
// ─────────────────────────────────────────────

export const stays: Stay[] = [
  // [0] 농막 — 강원 양양군 서면 갈천리 (산간, 8/14 → 8/15 · 1박)
  {
    name: "농막",
    address: "강원 양양군 서면 갈천리 12",
    area: "양양",
    place: {
      // 소유자가 제공한 Plus Code "WG4G+2P 양양군" (= 8Q9CWG4G+2P) 디코딩 값.
      // 역지오코딩 확인: 구룡령로, 갈천리, 서면, 양양군.
      lat: 37.9051,
      lng: 128.5268,
      // "농막"은 일반명사라 이름 검색이 무의미하다 — 폴백은 반드시 주소로.
      address: "강원 양양군 서면 갈천리 12",
    },
    // checkIn/checkOut 지정 없음
    facilities: {
      aircon: true,
      toilet: true,
      kitchen: true,
      electricity: true,
      bedding: true,
      // shower / wifi / parking 은 불명이라 생략
    },
    bring: [
      "세면도구",
      "헤드랜턴 또는 손전등",
      "모기기피제",
      "식재료 · 생수",
      "수건",
    ],
    cautions: [
      "산간이라 야생동물 · 벌레 출몰 가능",
      "통신(전화·데이터)이 약할 수 있음",
      "쓰레기는 되가져오기",
      "인근 계곡 접근 가능성이 있는 지역 — 호우특보 발효 시 계곡 접근 금지, 기상특보 수시 확인",
    ],
    accessNote:
      "구룡령로 변 산간이라 가로등이 없고, 도착이 23시 전후 야간입니다. 좌표는 확인된 값이지만 도로에서 갈라지는 진입로는 어두우면 놓치기 쉬우니 헤드랜턴을 손 닿는 곳에 두세요.",
    nights: "8/14 → 8/15 · 1박",
  },
  // [1] 서림원 — 강원 평창군 진부면 탑동길 108-50 (오대산 자락, 8/15 → 8/17 · 2박)
  {
    name: "서림원",
    address: "강원 평창군 진부면 탑동길 108-50",
    area: "평창",
    place: {
      // 진부면 탑동길 도로 기준 좌표 (Nominatim 지오코딩, 지번 단위 정밀도)
      lat: 37.6957,
      lng: 128.5577,
      address: "강원 평창군 진부면 탑동길 108-50",
    },
    checkIn: "15:00",
    checkOut: "11:00",
    phone: "033-336-2311",
    facilities: {
      aircon: true,
      toilet: true,
      kitchen: true,
      electricity: true,
      bedding: true,
      shower: true,
      wifi: true,
      parking: true,
    },
    bring: ["세면도구 (기본 제공되나 개인용 선호 시 지참)", "여벌 옷 · 수건"],
    cautions: [
      "오대산 산간이라 야간 기온이 낮 대비 크게 떨어짐",
      "계곡 근처는 우천 시 수위 급상승 주의",
      "호우특보 발효 시 계곡 접근 금지, 기상특보 수시 확인",
    ],
    nights: "8/15 → 8/17 · 2박",
  },
];

// ─────────────────────────────────────────────
// 날씨 지점
// ─────────────────────────────────────────────

export const weatherLocations: WeatherLocation[] = [
  // [0] 양양 산간 (서면, 농막 인근)
  { lat: 37.9051, lon: 128.5268, city: "양양", label: "양양 산간" },
  // [1] 강릉 해안 (안목해변 인근)
  { lat: 37.7728, lon: 128.9476, city: "강릉", label: "강릉 해안" },
  // [2] 평창 (진부면, 서림원 인근)
  { lat: 37.6957, lon: 128.5577, city: "평창", label: "평창" },
];

// ─────────────────────────────────────────────
// 루트 정류점
// ─────────────────────────────────────────────

const originPlace: Place = { lat: 37.5838, lng: 126.9094, address: "서울 은평구 증산역" };

export const ORIGIN: { place: Place; stop: RouteStop } = {
  place: originPlace,
  stop: { name: "증산역", emoji: "🚇", lat: 37.5838, lng: 126.9094 },
};

export const STOP: {
  yangyangStay: RouteStop;
  yangyangBeach: RouteStop;
  pyeongchangStay: RouteStop;
  gangneung: RouteStop;
} = {
  yangyangStay: { name: "농막", emoji: "🏕️", lat: stays[0].place.lat, lng: stays[0].place.lng },
  // 죽도해변 — 양양 서핑 중심지 (현남면)
  yangyangBeach: { name: "죽도해변", emoji: "🏄", lat: 37.9756, lng: 128.7596 },
  pyeongchangStay: { name: "서림원", emoji: "🏡", lat: stays[1].place.lat, lng: stays[1].place.lng },
  // 안목해변 — 강릉 커피거리, 강릉 방문의 대표 지점
  gangneung: { name: "안목해변", emoji: "☕", lat: 37.7728, lng: 128.9476 },
};

// ─────────────────────────────────────────────
// SOS 연락처
// ─────────────────────────────────────────────

// 실사용 우선순위 순: 서림원 기준 최적(강릉아산) → 농막 기준 최단(속초의료원) → 후순위(평창군보건의료원).
// 소요시간은 OSRM 도로주행 기준 추정치.
export const hospitals: Contact[] = [
  {
    label: "강릉아산병원 권역응급의료센터",
    number: "033-610-3331",
    note: "서림원(진부면)에서 약 51분 · 권역응급의료센터(최고 등급) — 서림원 숙박 시 우선 고려. 대표번호 033-610-3331~3334",
  },
  {
    label: "속초의료원 응급의료센터",
    number: "033-630-6190",
    note: "갈천리 농막에서 약 53분(가장 가까움) — 농막 숙박 시 우선 고려. 24시간 응급의학과 전문의 상주",
  },
  {
    label: "평창군보건의료원 응급실",
    number: "033-330-4812",
    note: "서림원에서 약 56분 — 강릉아산병원보다 멀고 등급도 낮아 후순위. 평창읍 소재, 24시간 연중무휴 운영",
  },
  {
    label: "실시간 응급실 조회 (E-GEN)",
    number: "www.e-gen.or.kr",
    note: "전화번호 아님 — 웹사이트로 가까운 응급실의 실시간 수용 가능 여부 · 진료과를 확인하는 응급의료포털",
  },
];

export const roadside: Contact[] = [
  {
    label: "한국도로공사 콜센터",
    number: "1588-2504",
    note: "고속도로 사고 시 무료 긴급 견인, 실시간 교통정보, 24시간 운영",
  },
  {
    label: "가입 보험사 긴급출동",
    number: "보험사 앱 · 보험증권에서 확인",
    note: "가입한 자동차 보험사마다 번호가 다릅니다. 출발 전 보험사 앱 또는 카드를 미리 확인해 두세요.",
  },
];

// 확인된 번호 없음: 농막은 연락처를 확인하지 못해 제외. 서림원만 등록.
export const stayContacts: Contact[] = [
  {
    label: "서림원",
    number: "033-336-2311",
    note: "체크인 15:00 · 체크아웃 11:00",
  },
];
