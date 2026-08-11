import { useOnline } from "@/hooks/useOnline";

/**
 * 오프라인일 때만 보이는 얇은 상단 배너.
 * 숙소 주소·연락처·일정처럼 이미 기기에 있는 정보는 그대로 볼 수 있다고 먼저 안심시키고,
 * 날씨·지도 타일·평점처럼 네트워크가 필요한 값만 제한된다는 점을 알린다.
 */
export default function OfflineBanner() {
  const isOnline = useOnline();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full bg-pine/10 border-b border-pine/20 px-4 py-2 text-center"
    >
      <p className="text-xs font-medium text-pine">
        📶 오프라인이에요 · 숙소 주소·연락처·일정은 그대로 볼 수 있어요. 날씨·지도 타일·평점만 잠시 제한돼요.
      </p>
    </div>
  );
}
