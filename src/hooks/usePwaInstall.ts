import { useState, useEffect, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// 모듈 스코프에서 이벤트를 즉시 캡처하여 EntryGate 단계에서도 놓치지 않음
let capturedEvent: BeforeInstallPromptEvent | null = null;
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    capturedEvent = e as BeforeInstallPromptEvent;
  });
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(capturedEvent);
  const [isInstalled, setIsInstalled] = useState(() => {
    const mq = window.matchMedia("(display-mode: standalone)");
    return (
      mq.matches ||
      ("standalone" in navigator &&
        (navigator as { standalone?: boolean }).standalone === true)
    );
  });
  const [dismissed, setDismissed] = useState(() => {
    try {
      const ts = localStorage.getItem("pwa-install-dismissed");
      if (!ts) return false;
      return Date.now() - Number(ts) < 1000 * 60 * 60 * 24 * 3;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isInstalled) return;

    const handler = (e: Event) => {
      e.preventDefault();
      capturedEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(capturedEvent);
    };

    const installedHandler = () => setIsInstalled(true);

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, [isInstalled]);

  const install = useCallback(async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
    } catch {
      // 브라우저가 프롬프트를 취소한 경우
    } finally {
      setDeferredPrompt(null);
      capturedEvent = null;
    }
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    setDismissed(true);
    setDeferredPrompt(null);
    capturedEvent = null;
    try {
      localStorage.setItem("pwa-install-dismissed", String(Date.now()));
    } catch {
      // localStorage 접근 불가 (private browsing 등)
    }
  }, []);

  const showPrompt = !!deferredPrompt && !isInstalled && !dismissed;

  return { showPrompt, install, dismiss, isInstalled };
}
