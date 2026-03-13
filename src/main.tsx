import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { tripConfig } from "@/config/trip";

// CSS 변수 주입 (config의 테마가 index.css 기본값을 오버라이드)
const root = document.documentElement;
for (const [key, value] of Object.entries(tripConfig.meta.cssVars)) {
  root.style.setProperty(key, value);
}

createRoot(document.getElementById("root")!).render(<App />);

// 서비스 워커 강제 갱신 — 캐시된 이전 JS 제거
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    for (const reg of regs) reg.update();
  });
}
