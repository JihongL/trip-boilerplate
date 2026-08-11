import { useState } from "react";
import { motion } from "framer-motion";
import Intro from "./Intro";
import TripDashboard from "./TripDashboard";
import { tripConfig } from "@/config/trip";

const isKakaoInApp = /KAKAOTALK/i.test(navigator.userAgent);
const isIOS = /(iPhone|iPad)/i.test(navigator.userAgent);

/** intro.onceOnly === true 일 때만 사용하는 "이미 봤음" 표시 키 */
const INTRO_SEEN_KEY = "trip-intro-seen";

function shouldShowIntroInitially(): boolean {
  if (!tripConfig.intro.enabled) return false;
  if (!tripConfig.intro.onceOnly) return true;
  try {
    return localStorage.getItem(INTRO_SEEN_KEY) !== "true";
  } catch {
    // private browsing 등으로 접근 불가하면 매번 보여주는 쪽이 안전하다
    return true;
  }
}

/**
 * 카카오톡 인앱브라우저에서는 PWA 설치가 막히므로 외부 브라우저로 열도록 안내한다.
 */
const KakaoRedirectScreen = () => {
  const [copied, setCopied] = useState(false);

  const handleAndroidOpen = () => {
    const intentUrl = `intent://${window.location.host}${window.location.pathname}#Intent;scheme=https;package=com.android.chrome;end`;
    window.location.href = intentUrl;
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ocean/10 via-background to-pine/10 p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="card-base max-w-sm w-full text-center space-y-6"
      >
        <div className="space-y-2">
          <div className="text-5xl mb-4">🌐</div>
          <h1 className="text-xl font-bold text-foreground leading-snug">
            외부 브라우저에서 열어주세요
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            카카오톡 내 브라우저에서는<br />앱 설치가 제한됩니다
          </p>
        </div>

        <div className="bg-secondary rounded-xl p-4 text-base text-secondary-foreground">
          ⋮ 메뉴 → 다른 브라우저로 열기
        </div>

        {isIOS ? (
          <div className="space-y-3">
            <button
              onClick={handleCopyUrl}
              aria-label="URL 복사"
              className="w-full min-h-[44px] bg-primary text-primary-foreground text-lg font-semibold py-3 px-6 rounded-xl active:opacity-80 transition-opacity"
            >
              {copied ? "✓ 복사됨" : "URL 복사"}
            </button>
            {copied && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-base text-primary font-medium"
              >
                복사 완료! Safari에서 붙여넣기 해주세요
              </motion.p>
            )}
          </div>
        ) : (
          <button
            onClick={handleAndroidOpen}
            aria-label="Chrome에서 열기"
            className="w-full min-h-[44px] bg-primary text-primary-foreground text-lg font-semibold py-3 px-6 rounded-xl active:opacity-80 transition-opacity"
          >
            Chrome에서 열기
          </button>
        )}
      </motion.div>
    </div>
  );
};

const Index = () => {
  const [showIntro, setShowIntro] = useState<boolean>(shouldShowIntroInitially);

  const handleEnter = () => {
    setShowIntro(false);
    if (tripConfig.intro.onceOnly) {
      try {
        localStorage.setItem(INTRO_SEEN_KEY, "true");
      } catch {
        /* private browsing */
      }
    }
  };

  if (isKakaoInApp) {
    return <KakaoRedirectScreen />;
  }

  if (showIntro) {
    return <Intro onEnter={handleEnter} />;
  }

  return <TripDashboard />;
};

export default Index;
