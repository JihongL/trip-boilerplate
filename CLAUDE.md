# Trip Boilerplate

여행 앱 보일러플레이트. `src/config/trip.ts`와 `src/config/trip.meta.json`만 수정하면 새 여행 앱 생성.

## 새 여행 config 생성 시

1. `src/config/types.ts`를 먼저 읽어 TripConfig 구조 파악
2. `src/config/trip.ts`의 베트남 예시를 참고하여 새 config 생성
3. `src/config/trip.meta.json`도 함께 갱신 (앱이름, 테마색, CSS 변수)
4. `public/` 폴더의 이미지를 새 여행에 맞게 교체 안내

## 기술 스택

React 18 + TypeScript + Vite 5 + Tailwind CSS + shadcn-ui + Framer Motion + React Leaflet + TanStack Query + PWA

## 주요 명령어

- `npm run dev` — 개발 서버 (port 8080)
- `npm run build` — 프로덕션 빌드
- `npm run preview` — 빌드 미리보기

## 환경 변수

- `VITE_OPENWEATHER_API_KEY` — OpenWeatherMap API 키 (.env 파일에 설정)
