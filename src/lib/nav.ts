import type { Place, NavApp } from "@/config/types";
import { tripConfig } from "@/config/trip";

/** 목적지로 길찾기를 실행할 수 있는 링크 하나. */
export interface NavTarget {
  app: NavApp;
  label: string;
  url: string;
}

const NAV_APP_LABELS: Record<NavApp, string> = {
  kakaonavi: "카카오내비",
  tmap: "T맵",
  kakaomap: "카카오맵",
  navermap: "네이버지도",
  googlemaps: "구글맵",
};

/**
 * 카카오맵 "길찾기" https 링크.
 * 모바일에서 카카오맵/카카오내비 앱이 설치돼 있으면 자동으로 앱으로 전환되고,
 * 없으면 웹 카카오맵으로 열려 절대 빈 화면이 되지 않는다.
 * kakaonavi 라벨도 이 링크를 그대로 쓴다 — 카카오내비 전용 https 딥링크는 공식 문서화돼 있지 않고,
 * 이 링크만으로도 설치된 카카오내비를 실행시킨다.
 */
function buildKakaoMapRouteUrl(place: Place, name: string): string {
  return `https://map.kakao.com/link/to/${encodeURIComponent(name)},${place.lat},${place.lng}`;
}

/**
 * 구글맵 길찾기 https 링크. 구글이 공식 문서화한 형식이라 데스크톱/모바일,
 * 앱 설치 여부와 무관하게 항상 동작한다.
 */
function buildGoogleMapsUrl(place: Place): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
}

/**
 * 네이버 지도 앱을 식별하기 위한 appname 값. 네이버 URL Scheme 은 등록된 앱 키를 검증하지
 * 않고 호출 주체를 구분하는 임의 문자열만 요구하므로 (공식 문서 참고), 이 웹앱을 가리키는
 * 고정 식별자를 쓴다.
 */
const NAVER_MAP_APPNAME = "trip-boilerplate-web";

/**
 * 네이버 지도 자동차 길찾기 URL Scheme.
 * 공식 문서(NAVER Cloud Platform, "지도 앱 연동 URL Scheme",
 * https://guide.ncloud-docs.com/docs/en/maps-url-scheme) 기준 현행 형식:
 *   nmap://route/car?dlat={lat}&dlng={lng}&dname={name}&appname={id}
 * dlat/dlng/dname/appname 이 필수이고, slat/slng(출발지)는 생략 시 사용자의 현재 위치가
 * 기본값이 되므로 자차 여행 길찾기에 그대로 맞는다.
 * https 검색 링크(map.naver.com/p/search)는 "길찾기"가 아니라 "검색"이라 여기서 쓰지 않는다.
 * nmap:// 은 T맵과 동일하게 커스텀 스킴이라 앱 미설치 시 반응이 없으므로,
 * 반드시 openNavTarget() 으로 실행하고 https 폴백(buildWebFallbackUrl)을 함께 지정해야 한다.
 */
function buildNaverMapUrl(place: Place, name: string): string {
  const params = new URLSearchParams({
    dlat: String(place.lat),
    dlng: String(place.lng),
    dname: name,
    appname: NAVER_MAP_APPNAME,
  });
  return `nmap://route/car?${params.toString()}`;
}

/**
 * T맵 길찾기 커스텀 스킴.
 * T맵은 https 딥링크를 제공하지 않는다. 앱이 없으면 스킴 실행이 아무 반응 없이 끝나
 * 사용자가 빈 화면에 갇히므로, 반드시 openNavTarget() 과 함께 폴백 URL(buildWebFallbackUrl)을 지정해 써야 한다.
 */
function buildTmapUrl(place: Place, name: string): string {
  return `tmap://route?goalname=${encodeURIComponent(name)}&goalx=${place.lng}&goaly=${place.lat}`;
}

function buildUrlForApp(app: NavApp, place: Place, name: string): string {
  switch (app) {
    case "kakaonavi":
    case "kakaomap":
      return buildKakaoMapRouteUrl(place, name);
    case "tmap":
      return buildTmapUrl(place, name);
    case "navermap":
      return buildNaverMapUrl(place, name);
    case "googlemaps":
      return buildGoogleMapsUrl(place);
    default:
      return buildKakaoMapRouteUrl(place, name);
  }
}

/** 목적지로 길찾기를 실행할 수 있는 링크 목록. config 의 navApps 순서를 따른다. */
export function buildNavTargets(place: Place, name: string, apps?: NavApp[]): NavTarget[] {
  const appList = apps ?? tripConfig.navApps ?? [];
  return appList.map((app) => ({
    app,
    label: NAV_APP_LABELS[app],
    url: buildUrlForApp(app, place, name),
  }));
}

/**
 * 장소 상세 보기 URL. 이 앱의 지도 표준은 **네이버 지도**이므로 네이버를 먼저 본다.
 * (카카오는 맛집 평점 출처로만 쓰고 지도 연동에는 쓰지 않는다.)
 */
export function buildPlaceUrl(place: Place, name: string): string {
  if (place.naverPlaceUrl) return place.naverPlaceUrl;
  if (place.kakaoPlaceUrl) return place.kakaoPlaceUrl;
  return buildNaverWebUrl(place, name);
}

/**
 * 커스텀 스킴(nmap://, tmap://)이 아무것도 열지 못했을 때의 https 폴백.
 *
 * 지도 표준이 네이버이므로 폴백도 네이버로 보낸다. 좌표 기반 길찾기 https 경로는
 * 네이버 지도 UI 개편 이후 안정적으로 문서화된 형태가 없어, 확실히 동작하는 검색 URL을 쓴다.
 * 길찾기가 아니라 검색이지만, 폴백의 목적은 "사용자를 빈 화면에 가두지 않는 것"이고
 * 네이버 안에서 길찾기로 이어갈 수 있으므로 이 절충이 타당하다.
 */
export function buildWebFallbackUrl(place: Place, name: string): string {
  if (place.naverPlaceUrl) return place.naverPlaceUrl;
  return buildNaverWebUrl(place, name);
}

function buildNaverWebUrl(place: Place, name: string): string {
  return `https://map.naver.com/p/search/${encodeURIComponent(name)}`;
}

const APP_SWITCH_FALLBACK_DELAY_MS = 1500;

/**
 * 커스텀 스킴(T맵·네이버지도 등) 내비 링크를 실행하고, 앱이 열리지 않았다고 판단되면
 * https 폴백 링크로 보낸다.
 *
 * 두 가지 실패 모드를 모두 피해야 한다.
 *
 * 1. **무조건 폴백**: 타임아웃 때 조건 없이 이동시키면, 앱이 정상적으로 열린 경우에도
 *    뒤에 남은 탭이 카카오맵으로 이동해 버린다. PWA 는 SPA 라 이때 앱 상태가 통째로
 *    날아가고, 사용자가 브라우저로 돌아오면 지도 웹페이지를 보게 된다.
 *    이건 **정상 경로에서 매번** 일어나므로 가장 나쁘다.
 *
 * 2. **`document.hidden` 순간값으로 판단**: 타임아웃 시점의 hidden 여부만 보면,
 *    전화·알림 때문에 잠깐 백그라운드로 갔다가 돌아온 경우를 "앱 전환 성공"으로 오인한다.
 *
 * 그래서 "클릭 이후 한 번이라도 숨겨진 적이 있는가"를 기록해서 판단한다. 앱 전환은 반드시
 * 탭을 숨기므로 이 플래그가 서고, 그 경우에만 폴백을 취소한다. 무관한 백그라운드 전환과는
 * 여전히 구분되지 않지만, 그때는 아무 일도 일어나지 않을 뿐이라 사용자가 다시 누르면 된다.
 *
 * 주의: 현재 navApps(네이버지도·T맵)는 둘 다 커스텀 스킴이라 버튼 행에 https 버튼이 없다.
 * 따라서 이 폴백이 유일한 안전망이다 — 조건을 더 좁히지 말 것.
 */
export function openNavTarget(target: NavTarget, fallbackUrl: string): void {
  if (typeof window === "undefined") return;

  let wasHidden = document.hidden;
  const markHidden = () => {
    if (document.hidden) wasHidden = true;
  };
  document.addEventListener("visibilitychange", markHidden);

  window.setTimeout(() => {
    document.removeEventListener("visibilitychange", markHidden);
    // 탭이 한 번도 숨겨지지 않았다 = 스킴이 아무것도 열지 못했다 → 폴백
    if (!wasHidden && !document.hidden) {
      window.location.href = fallbackUrl;
    }
  }, APP_SWITCH_FALLBACK_DELAY_MS);

  window.location.href = target.url;
}
