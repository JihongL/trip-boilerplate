# Trip Boilerplate

Config-driven travel app boilerplate. Config 파일 하나만 바꾸면 새로운 여행 앱 완성.

## Tech Stack

Vite · React 18 · TypeScript · Tailwind CSS · shadcn/ui · PWA

## Quick Start

```sh
git clone https://github.com/JihongL/trip-boilerplate.git
cd trip-boilerplate
npm install
npm run dev
```

## New Trip 만들기

1. `src/config/trip.ts` — 일정, POI, 연락처, 환율 등 데이터 수정
2. `src/config/trip.meta.json` — 앱 이름, 테마색, PWA 설정 수정
3. `public/` — 헤더/배경 이미지 교체
4. `.env` — `VITE_OPENWEATHER_API_KEY` 설정

또는 Claude Code에게:

```
"일본 오사카 3박4일 여행으로 config 만들어줘"
```

자세한 가이드: [TRIP-GUIDE.md](./TRIP-GUIDE.md)

## Config 구조

```
src/config/
├── types.ts           # TripConfig 타입 정의
├── trip.ts            # 여행 데이터 (베트남 예시 포함)
└── trip.meta.json     # 빌드타임 메타 (앱이름, 테마색, PWA)
```
