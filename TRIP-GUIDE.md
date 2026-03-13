# 새 여행 만들기 가이드

## 방법 1: Claude Code 사용 (추천)

"일본 오사카 3박4일 여행으로 config 만들어줘" 한 마디면 끝!

Claude Code가 `src/config/types.ts`를 읽고 정확한 config를 생성합니다.

## 방법 2: 수동 편집

1. `src/config/trip.ts` — 일정, POI, 연락처, 환율 등 수정
2. `src/config/trip.meta.json` — 앱이름, 테마색 수정
3. `public/` — 헤더/배경 이미지 교체
4. `.env` — OpenWeatherMap API 키 설정
5. `npm run dev`로 확인

## config 파일 구조

| 파일 | 역할 |
|------|------|
| `src/config/types.ts` | 타입 정의 (수정 불필요) |
| `src/config/trip.ts` | 여행 데이터 (수정 필요) |
| `src/config/trip.meta.json` | PWA/테마 설정 (수정 필요) |
