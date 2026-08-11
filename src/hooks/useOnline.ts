import { useEffect, useState } from "react";

function getInitialOnlineStatus(): boolean {
  // SSR/테스트 환경처럼 navigator 가 없거나 onLine 이 지원되지 않으면
  // "온라인"으로 가정해 불필요하게 빈 화면/경고를 띄우지 않는다.
  if (typeof navigator === "undefined" || typeof navigator.onLine !== "boolean") {
    return true;
  }
  return navigator.onLine;
}

/** 브라우저 네트워크 상태를 구독한다. */
export function useOnline(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(getInitialOnlineStatus);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
