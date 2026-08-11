import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

/**
 * 테마 변수는 index.css 의 `:root` / `.dark` 가 단일 소스다.
 *
 * 이전에는 trip.meta.json 의 cssVars 를 documentElement 에 인라인 style 로 주입했는데,
 * 인라인 스타일은 `.dark` 클래스 규칙보다 항상 우선하므로 다크모드가 영구히 무력화됐다.
 * 새 여행 config 를 만들 때는 trip.meta.json 의 cssVars 와 index.css 를 함께 갱신할 것.
 */
createRoot(document.getElementById("root")!).render(<App />);

// 서비스 워커 강제 갱신 — 캐시된 이전 JS 제거
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    for (const reg of regs) reg.update();
  });
}
