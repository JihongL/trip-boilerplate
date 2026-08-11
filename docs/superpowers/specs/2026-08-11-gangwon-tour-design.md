# 2026 강원도 여행 앱 설계

**작성일:** 2026-08-11
**상태:** 검토 대기
**여행일:** 2026-08-14(금) ~ 08-17(월), 3박 4일

## 1. 요약

`trip-boilerplate`를 최신화하여 **국내여행 프로필**을 지원하게 만든 뒤, 그로부터 **강원도 2인 여름휴가 가이드 PWA**(`Gangwon-tour`)를 파생한다.

기존 `Vietnam-tour`, `Hokkaido-tour`는 수정하지 않는다.

```
1단계  trip-boilerplate 최신화     (홋카이도 개선분 백포트 + 국내여행 지원)
          ↓ 복제
2단계  tour-guide/Gangwon-tour/    (config 작성)
          ↓ push
3단계  private repo → GitHub Actions → GitHub Pages
```

### 일정 리스크 (명시적 기록)

출발까지 3일 남은 시점에 1단계(백포트 7건 + 신규 10건)를 선행하는 계획이다. 출발 전 완성은 보장되지 않으며, 사용자가 이 트레이드오프를 인지하고 선택했다. 미완성 시 여행 중 가치는 0이 될 수 있다.

우선순위는 아래 §7 구현 순서를 따르며, 상위 항목만으로도 앱이 성립하도록 설계했다.

## 2. 확정된 결정

| 결정 항목 | 선택 | 근거 |
|---|---|---|
| 기반 코드 | boilerplate 최신화 후 파생 | 분기 3개 방지, 4번째 여행부터 config 한 장 |
| 4번째 탭 | 맛집 탭 | 홋카이도 `restaurants.ts` 787줄 자산 승격, 국내여행 최다 조회 화면 |
| 진입 화면 | 인트로 + D-day (서약 제거) | 2인 여행에서 "규칙 서약"은 전제가 성립하지 않음 |
| 콘텐츠 | 하이브리드 + 출처 기준 | 블루리본/미쉐린/카카오맵/캐치테이블 기준, `needs-check` 기본값 |
| 배포 | private 레포 + GitHub Pages | 숙박 주소·체류 날짜 공개 차단, 홋카이도 워크플로 재사용 |

## 3. 여행 데이터

### 기본 정보

- **기간:** 2026.08.14(금) ~ 08.17(월), 3박 4일
- **인원:** 2명
- **이동:** 자차
- **출발:** 8/14(금) 20:00, 증산역(서울 은평구, 6호선) — *가정. 정선 증산역은 2009년 민둥산역으로 개명*
- **테마:** 바다와 소나무 / 여름휴가
- **공휴일:** 8/15(토) 광복절 → 8/17(월) 대체공휴일

### 숙소

| # | 이름 | 주소 | 체크인 | 체크아웃 | 숙박 |
|---|---|---|---|---|---|
| 1 | 농막 | 강원 양양군 서면 갈천리 12 | 지정 없음 | 지정 없음 | 8/14 → 8/15 (1박) |
| 2 | 서림원 | 강원 평창군 탑동길 108-50 | 15:00 | 11:00 | 8/15 → 8/17 (2박) |

**농막 시설:** 에어컨 · 화장실 · 취사 · 전기 · 이불 모두 구비 (`facilities` 전부 true → 준비물 목록 최소화)

### 일자별 골격

| Day | 날짜 | 숙소 | 주 동선 | 특이사항 |
|---|---|---|---|---|
| 1 | 8/14 (금) | 농막 | 증산역 20:00 출발 → 양양 갈천리 (~190km, 2h40m) | **23시 전후 야간 산길 도착.** 20시 출발은 금요일 정체(15~19시 피크) 회피 시간대 |
| 2 | 8/15 (토) | 서림원 1/2 | 양양 활동 → 평창 이동, 15:00 체크인 | 광복절 |
| 3 | 8/16 (일) | 서림원 2/2 | 강릉 왕복 (평창↔강릉 약 50분, 대관령 경유) | |
| 4 | 8/17 (월) | — | 11:00 체크아웃 → 귀가 | 대체공휴일 |

**동선 특성:** 목적지는 양양·강릉이나 8/15부터 평창 숙박이므로 매일 왕복이 발생한다. 일정 설계 시 이동 시간을 명시적으로 타임라인에 넣는다.

## 4. 아키텍처

### 4.1 boilerplate 백포트 (Hokkaido → boilerplate)

| # | 항목 | 출처 | 내용 |
|---|---|---|---|
| B1 | 카카오 인앱브라우저 대응 | `Index.tsx` | `KAKAOTALK` UA 감지 → 외부 브라우저 유도 화면 |
| B2 | 일자별 이동경로 지도 | `TodayTab.tsx` `DayRouteMap` | 그날 동선 Polyline 표시 |
| B3 | 일자별 날씨 카드 | `TodayTab.tsx` | 날짜별 예보 + 예보 범위 밖 fallback |
| B4 | 타임라인 장소 링크 | `ScheduleItem` | `place: { lat, lng, kakaoPlaceUrl?, naverPlaceUrl? }` 로 일반화 |
| B5 | 식당 데이터 레이어 | `data/restaurants.ts` | config 스키마로 승격 + 신뢰도 필드 |
| B6 | PWA 설치 배너 개선 | `PwaInstallBanner.tsx` | 49줄 → 330줄 버전 (iOS/Android 분기) |
| B7 | placeholder 일정 타입 | `ScheduleItem.type` | 미정 일정을 "미정"으로 정직하게 표시 |

### 4.2 국내여행 지원 신규 작업

| # | 작업 | 상세 |
|---|---|---|
| N1 | **원탭 내비 실행** | `navApps: ["kakaonavi","tmap","googlemaps"]`. 모든 장소(POI·숙소·맛집·일정)에 공통 `<NavButton>`. **최우선 기능** |
| N2 | **오프라인 안전망** | 숙소 주소·전화·체크인 정보는 config에서 정적으로 렌더 — 어떤 네트워크 호출에도 의존하지 않는다. 여행 지역 지도 타일 프리캐시. 오프라인 감지 시 상태 배너 표시 및 날씨·평점 등 네트워크 의존 UI를 캐시값 또는 안내 문구로 대체 |
| N3 | 탭 config화 | `tabs: ["today","map","food","sos"]` — BottomNav·TripDashboard가 배열을 읽어 렌더 |
| N4 | `pledge` → `intro` 전환 | 타이틀 + D-day + 진입 버튼. 애니메이션·연출 생략 |
| N5 | 해외 전용 필드 optional화 | `exchange`, `flights`, `sos.consulate`, `sos.lostPassportSteps` |
| N6 | `parentTip` → `dayTip` | 라벨은 config로 지정 |
| N7 | `FoodTab` 신규 | 영업상태 뱃지 우선, 지역/끼니 필터, 예약 플랫폼 링크 |
| N8 | `Hotel` → `Stay` 확장 | `facilities`, `bring`, `cautions`, `accessNote` 추가 |
| N9 | 국내 SOS 프로필 | 119 · 112 · 한국도로공사 1588-2504 · 보험사 · 지역 응급의료기관 · 숙소 연락처 |
| N10 | POI 국내 필드 | `admission`(입장료), `parking`(주차·요금), `openHours`, `crowdLevel`(성수기 혼잡) |

### 4.3 핵심 타입

```ts
interface Place {
  lat: number; lng: number;
  kakaoPlaceUrl?: string;
  naverPlaceUrl?: string;
}

interface Stay {
  name: string; address: string; area: string;
  place: Place;
  checkIn?: string; checkOut?: string;     // 농막처럼 미지정 가능
  phone?: string;
  facilities: {
    aircon: boolean; toilet: boolean; kitchen: boolean;
    electricity: boolean; bedding: boolean;
  };
  bring: string[];                          // 시설에 없어서 챙길 것
  cautions: string[];
  accessNote?: string;                      // 진입로 안내 (야간 도착 대비)
}

interface Restaurant {
  name: string; category: string; area: string;
  signature: string[];
  address: string; place: Place;
  hours: string; closedDays: string; breakTime?: string;
  priceRange: string;
  credentials: {
    awards?: string[];                                       // "블루리본 2025"
    rating?: { score: number; count: number; source: "카카오맵" | "네이버" };
    reservation?: { platform: "캐치테이블" | "테이블링" | "전화"; required: boolean };
  };
  verification: "confirmed" | "needs-check";                 // 기본값 needs-check
  verifiedAt?: string;
  note?: string;
}

interface POI {
  emoji: string; name: string; category: string; area: string;
  description: string; why: string;
  address: string; place: Place;
  visitTime: string;
  openHours?: string;
  admission?: string;                       // 입장료
  parking?: { available: boolean; fee?: string; note?: string };
  crowdLevel?: "low" | "mid" | "high";      // 8월 성수기 기준
  familyNote?: string;
}
```

### 4.4 화면 구성

```
Intro (최소)  →  Dashboard
                  ├─ 오늘   TodayTab   일정 타임라인 + 이동경로 지도 + 날씨(3지점) + 오늘의 팁
                  ├─ 지도   MapTab     POI 마커 + 숙소 + 원탭 내비
                  ├─ 맛집   FoodTab    영업상태 뱃지 → 수상/평점 → 예약 → 내비
                  └─ SOS    SosTab     119·112 · 도로공사 · 보험 · 지역 응급실 · 숙소 연락처(오프라인)
```

### 4.5 날씨

산간과 해안의 예보가 다르므로 **3지점**을 조회한다.

| 지점 | 용도 |
|---|---|
| 양양 서면 (산간 내륙) | Day 1~2 숙소 |
| 강릉 (해안) | Day 3 |
| 평창 (산간) | Day 2~4 숙소 |

8월 영동 지역은 태풍·호우 가능성이 있으므로 기온 예보와 함께 **기상특보**를 표시한다.

## 5. 디자인

### 팔레트 — 3색 체제

동해 블루와 소나무 그린은 둘 다 차가운 중명도라 2색만으로는 시각 계층이 서지 않는다. 웜톤 액센트를 1개 추가한다.

| 역할 | 색 | 용도 |
|---|---|---|
| Primary | 동해 블루 `#1E6F9F` | 헤더, 주요 액션, 링크 |
| Secondary | 소나무 그린 `#2E5D4B` | 지역 배지, 보조 강조, 지도 폴리라인 |
| Accent | 백사장 샌드 `#E5B77C` | 오늘/현재 표시, CTA, 영업중 뱃지 — 유일한 웜톤 |
| Surface | 안개 `#F7F9FA` | 배경 |
| Text | `#16232B` | 본문 |

### 헤더

현지 사진 자산이 없고 라이선스 안전한 사진 수급에 시간이 든다. **`동해 블루 → 소나무 그린` 그라데이션 + 대관령 능선 SVG 실루엣**으로 대체한다.

### 모드 우선순위

8월 강원도 낮은 야외 직사광선 환경이므로 **라이트모드 고대비**가 실사용 조건이다. 다크모드는 토큰만 정의하고 야간 최소 대응, 튜닝은 후순위.

## 6. 콘텐츠 정책

- **수집 기준:** 블루리본 / 미쉐린 / 카카오맵 평점 / 캐치테이블·테이블링 인기
- **기본값:** `verification: "needs-check"` — 앱에서 회색 배지로 구분 표시
- **`confirmed` 승격 조건:** 실제 예약했거나 직접 확인한 곳만
- **지역:** 양양(서핑·해수욕장·물회), 강릉(커피거리·해변·초당순두부), 평창(대관령·계곡)
- 8월 성수기 특성상 **영업상태·브레이크타임·웨이팅**을 평점보다 상위에 노출

## 7. 구현 순서 (가치 우선)

상위 항목만으로도 앱이 성립하도록 배열했다. 시간이 모자라면 아래에서 잘라낸다. 1단계(boilerplate)와 2단계(강원도 config) 작업이 가치 순으로 섞여 있다 — 각 항목은 boilerplate에 구현한 뒤 즉시 강원도 config로 검증하는 순서로 진행한다.

1. 🔴 N1 원탭 내비 실행
2. 🔴 N2 오프라인 안전망 (숙소 주소·전화 인라인)
3. 🔴 N8 `Stay` 확장 + 숙소 2곳 데이터
4. 🔴 N3 탭 config화 + N5 해외 필드 optional화
5. 🟡 B2 이동경로 지도 + B4 장소 링크 + B7 placeholder
6. 🟡 N7 FoodTab + B5 식당 스키마 + N10 POI 국내 필드
7. 🟡 B3 날씨 3지점 + 기상특보
8. 🟢 N4 인트로, B1 카카오 대응, B6 PWA 배너, N9 SOS
9. 🟢 N6 `dayTip` 리네임, 다크모드 튜닝

## 8. 배포

- 신규 **private** GitHub 레포 `Gangwon-tour`
- `main` push → GitHub Actions → GitHub Pages (홋카이도 `deploy.yml` 재사용)
- `vite.config.ts` `base: "/Gangwon-tour/"`
- `gh-pages` 브랜치 사용 금지 — `main`에서 직접 배포
- `VITE_OPENWEATHER_API_KEY`는 GitHub Secrets

## 9. 범위 제외 (YAGNI)

- 경비 정산 기능
- 다국어, 서버 사이드 기능, CLI 스캐폴딩 도구
- `Vietnam-tour` / `Hokkaido-tour` 의 boilerplate 마이그레이션
- 사진 자산 제작·수급

## 10. 미해결 가정

| 항목 | 가정 | 영향 |
|---|---|---|
| 증산역 | 서울 6호선 증산역(은평구) | 틀리면 Day 1 거리·도착 시각 전면 수정 |
| 숙소 좌표 | 지번/도로명 주소 지오코딩 | 농막은 진입로가 내비에 안 잡힐 수 있음 → `accessNote`와 야간 도착 준비물로 완충 |
| 맛집 정보 | 전부 `needs-check` | 여행 임박 또는 현지에서 확정 갱신 |
