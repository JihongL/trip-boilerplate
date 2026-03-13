import { useState, useRef, useCallback, useEffect, useImperativeHandle, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface EntryGateProps {
  onEnter: () => void;
}

const rules = [
  { num: "하나", text: "아직 멀었냐 금지" },
  { num: "둘", text: "음식이 달다 금지" },
  { num: "셋", text: "음식이 짜다 금지" },
  { num: "넷", text: "겨우 이거 보러 왔냐 금지" },
  { num: "다섯", text: "조식 이게 다냐 금지" },
  { num: "여섯", text: "돈 아깝다 금지" },
  { num: "일곱", text: "이 돈이면 집에서 해먹는게 낫다 금지" },
  { num: "여덟", text: "이거 무슨맛으로 먹냐 금지" },
  { num: "아홉", text: "이거 한국 돈으로 얼마냐 금지" },
  { num: "열", text: "물이 제일 맛있다 금지" },
];

/* ── Signature Pad ── */

interface SignaturePadProps {
  onSigned: (dataUrl: string) => void;
  onClear: () => void;
  hasSigned: boolean;
}

interface SignaturePadHandle {
  /** 캔버스에서 동기적으로 서명 이미지를 추출 (획이 없으면 null) */
  getSignature: () => string | null;
}

const SignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>(
  ({ onSigned, onClear, hasSigned }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const hasRealStrokes = useRef(false);
  const totalDistance = useRef(0);
  const MIN_STROKE_DISTANCE = 3;

  useImperativeHandle(ref, () => ({
    getSignature: () => {
      if (hasRealStrokes.current && canvasRef.current) {
        return canvasRef.current.toDataURL("image/png");
      }
      return null;
    },
  }));

  const getCtx = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    return { canvas, ctx };
  }, []);

  // Setup canvas resolution
  useEffect(() => {
    const c = getCtx();
    if (!c) return;
    const rect = c.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    c.canvas.width = rect.width * dpr;
    c.canvas.height = rect.height * dpr;
    c.ctx.scale(dpr, dpr);
    c.ctx.lineCap = "round";
    c.ctx.lineJoin = "round";
    c.ctx.lineWidth = 2.5;
    c.ctx.strokeStyle = "hsl(20, 20%, 15%)";
  }, [getCtx]);

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if ("pointerId" in e) {
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    isDrawing.current = true;
    lastPoint.current = getPoint(e);
    totalDistance.current = 0;
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing.current || !lastPoint.current) return;
    const c = getCtx();
    if (!c) return;
    const point = getPoint(e);
    if (!point) return;
    const dx = point.x - lastPoint.current.x;
    const dy = point.y - lastPoint.current.y;
    totalDistance.current += Math.sqrt(dx * dx + dy * dy);
    c.ctx.beginPath();
    c.ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    c.ctx.lineTo(point.x, point.y);
    c.ctx.stroke();
    lastPoint.current = point;
  };

  const endDraw = (e?: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    if (e && "pointerId" in e && e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    isDrawing.current = false;
    lastPoint.current = null;
    // 최소 이동거리 충족 시에만 서명으로 인정
    if (totalDistance.current >= MIN_STROKE_DISTANCE && canvasRef.current) {
      hasRealStrokes.current = true;
      onSigned(canvasRef.current.toDataURL("image/png"));
    }
  };

  const clearCanvas = () => {
    const c = getCtx();
    if (!c) return;
    const rect = c.canvas.getBoundingClientRect();
    c.ctx.clearRect(0, 0, rect.width, rect.height);
    hasRealStrokes.current = false;
    totalDistance.current = 0;
    onClear();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-foreground">서명해주세요</p>
        {hasSigned && (
          <button
            onClick={clearCanvas}
            className="text-xs text-muted-foreground underline active:opacity-60"
          >
            다시 쓰기
          </button>
        )}
      </div>
      <div
        className="relative rounded-2xl border-2 border-dashed overflow-hidden"
        style={{
          borderColor: hasSigned ? "hsl(var(--primary))" : "hsl(var(--border))",
          background: hasSigned ? "hsl(var(--primary) / 0.03)" : "hsl(var(--card))",
        }}
      >
        <canvas
          ref={canvasRef}
          className="w-full touch-none"
          style={{ height: 120, cursor: "crosshair", touchAction: "none" }}
          onPointerDown={startDraw}
          onPointerMove={draw}
          onPointerUp={endDraw}
          onPointerLeave={endDraw}
          onPointerCancel={endDraw}
        />
        {!hasSigned && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-sm text-muted-foreground/50">여기에 손가락으로 서명</p>
          </div>
        )}
      </div>
    </div>
  );
});

/* ── Save 10계명 + signature as downloadable image ── */

/** 10계명 + 이름 + 서명을 합성한 이미지 Blob을 생성 */
async function buildPledgeImage(name: string, signatureDataUrl: string): Promise<string | null> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  try { await document.fonts.ready; } catch { /* ignore */ }

  const dpr = 2;
  const w = 360;
  const pad = 24;
  const lineH = 28;
  const titleH = 50;
  const ruleStartY = titleH + pad;
  const rulesH = rules.length * lineH + 16;
  const dividerY = ruleStartY + rulesH;
  const pledgeTextY = dividerY + 28;
  const dateY = pledgeTextY + 24;
  const nameY = dateY + 28;
  const sigLabelY = nameY + 28;
  const sigImgY = sigLabelY + 8;
  const sigH = 80;
  const totalH = sigImgY + sigH + pad;

  canvas.width = w * dpr;
  canvas.height = totalH * dpr;
  ctx.scale(dpr, dpr);

  // Background
  ctx.fillStyle = "#FAF6F1";
  ctx.fillRect(0, 0, w, totalH);

  // Title
  ctx.fillStyle = "#2D2016";
  ctx.font = "bold 18px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("우리 가족 베트남 여행 10계명", w / 2, pad + 22);

  // Divider under title
  ctx.strokeStyle = "#E0D5C8";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, titleH + 8);
  ctx.lineTo(w - pad, titleH + 8);
  ctx.stroke();

  // Rules
  ctx.textAlign = "left";
  rules.forEach((rule, i) => {
    const y = ruleStartY + 20 + i * lineH;
    ctx.fillStyle = "#C45A20";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText(rule.num, pad, y);
    ctx.fillStyle = "#2D2016";
    ctx.font = "500 13px sans-serif";
    ctx.fillText(rule.text, pad + 36, y);
  });

  // Divider before signature
  ctx.strokeStyle = "#E0D5C8";
  ctx.beginPath();
  ctx.moveTo(pad, dividerY);
  ctx.lineTo(w - pad, dividerY);
  ctx.stroke();

  // 서약 문구
  ctx.fillStyle = "#2D2016";
  ctx.font = "500 12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("위 내용을 충실히 이행할 것을 약속합니다.", w / 2, pledgeTextY);

  // 날짜
  const dateStr = new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
  ctx.fillStyle = "#8B7355";
  ctx.font = "500 11px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(dateStr, w / 2, dateY);

  // 이름
  ctx.fillStyle = "#666";
  ctx.font = "500 11px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("이름:", pad, nameY);
  ctx.fillStyle = "#2D2016";
  ctx.font = "bold 14px sans-serif";
  ctx.fillText(name, pad + 40, nameY);

  // 서명 라벨
  ctx.fillStyle = "#666";
  ctx.font = "500 11px sans-serif";
  ctx.fillText("서명:", pad, sigLabelY);

  // Load signature image
  try {
    const sigImg = await new Promise<HTMLImageElement>((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = signatureDataUrl;
    });
    ctx.drawImage(sigImg, pad + 40, sigImgY, w - pad * 2 - 40, sigH);
  } catch { /* signature draw failed */ }

  // Canvas → Blob → Object URL
  const blob = await new Promise<Blob | null>((res) =>
    canvas.toBlob((b) => res(b), "image/png")
  );
  if (!blob) return null;
  return URL.createObjectURL(blob);
}

/* ── EntryGate ── */

const EntryGate = ({ onEnter }: EntryGateProps) => {
  const [step, setStep] = useState<"intro" | "rules">("intro");
  const [agreed, setAgreed] = useState(false);
  const [signerName, setSignerName] = useState("");
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [showSignature, setShowSignature] = useState(false);
  const [noCount, setNoCount] = useState(0);
  // "서약 완료" 누르면 합성 이미지를 화면에 표시
  const [pledgeImageUrl, setPledgeImageUrl] = useState<string | null>(null);
  const [showPledge, setShowPledge] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const signatureRef = useRef<string | null>(null);
  const padRef = useRef<SignaturePadHandle>(null);

  const hasSigned = !!signatureData;
  const hasName = signerName.trim().length > 0;
  const canEnter = agreed && hasName;

  // Blob URL 클린업
  useEffect(() => {
    return () => {
      if (pledgeImageUrl) URL.revokeObjectURL(pledgeImageUrl);
    };
  }, [pledgeImageUrl]);

  const handleAgreeChange = (checked: boolean) => {
    setAgreed(checked);
    if (checked) {
      setShowSignature(true);
    }
  };

  const handleSigned = useCallback((dataUrl: string) => {
    signatureRef.current = dataUrl;
    setSignatureData(dataUrl);
  }, []);

  const handleClearSignature = useCallback(() => {
    signatureRef.current = null;
    setSignatureData(null);
  }, []);

  // "서약 완료" → 합성 이미지 생성 → 화면에 표시
  const handleShowPledge = async () => {
    if (isBuilding) return;
    // padRef에서 동기적으로 캔버스 데이터 추출 (이벤트 순서 무관)
    const sig = padRef.current?.getSignature() || signatureRef.current || signatureData;
    if (!sig) {
      alert("서명을 먼저 해주세요!");
      return;
    }
    setIsBuilding(true);

    try {
      // 이전 Blob URL 해제
      if (pledgeImageUrl) URL.revokeObjectURL(pledgeImageUrl);

      const url = await buildPledgeImage(signerName.trim(), sig);
      if (url) {
        setPledgeImageUrl(url);
        setShowPledge(true);
        setSaved(false);
      }
    } finally {
      setIsBuilding(false);
    }
  };

  const noMessages = [
    "다시 한번 생각해보세요... 🤔",
    "진심이세요?! 다낭인데요?! 🏖️",
    "서여사님 이러시면 안 됩니다 😭",
    "마지막 기회입니다... 진짜요?",
    "알겠습니다... (참가 버튼이 커집니다)",
  ];

  const handleNo = () => {
    setNoCount((prev) => Math.min(prev + 1, noMessages.length));
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: "url('/vietnam_resort_bg.webp')" }}
      />

      <AnimatePresence mode="wait">
        {/* ── Step 1: Intro — 참가 의사 확인 ── */}
        {step === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-md mx-auto relative z-10"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-8"
            >
              <div className="flex justify-center mb-4">
                <img src="/vacation_3d_icon.png" alt="Vacation Icon" className="w-28 h-28 object-contain drop-shadow-xl" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                우리 가족 베트남 여행
              </h1>
              <p className="text-lg text-muted-foreground">
                서여사님 생신 축하드립니다! 🎂
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="card-base text-center mb-6"
            >
              <p className="text-3xl mb-3">🇻🇳</p>
              <h2 className="text-xl font-bold text-foreground mb-2">
                서여사 생신기념 다낭 · 호이안 여행
              </h2>
              <p className="text-base text-muted-foreground mb-1">
                2026.03.20 (금) ~ 03.23 (월) · 3박 4일
              </p>
              <p className="text-sm text-muted-foreground">
                자녀들이 준비한 특별한 여행에
              </p>
              <p className="text-lg font-bold text-primary mt-3">
                참가하시겠습니까?
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
              className="space-y-3"
            >
              <button
                onClick={() => setStep("rules")}
                className="w-full py-4 rounded-2xl font-bold transition-all duration-300 bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]"
                style={{ fontSize: noCount >= 4 ? "1.5rem" : "1.125rem" }}
              >
                당연하죠! 참가합니다 ✈️
              </button>
              <button
                onClick={handleNo}
                className="w-full py-3 rounded-2xl text-sm font-medium text-muted-foreground bg-secondary/60 hover:bg-secondary active:scale-[0.98] transition-all"
                style={{
                  fontSize: noCount >= 4 ? "0.65rem" : "0.875rem",
                  opacity: noCount >= 4 ? 0.4 : 1,
                }}
              >
                {noCount === 0 ? "글쎄요..." : "아니요..."}
              </button>
              <AnimatePresence>
                {noCount > 0 && (
                  <motion.p
                    key={noCount}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-center text-sm font-semibold text-primary"
                  >
                    {noMessages[noCount - 1]}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="text-center text-xs text-muted-foreground mt-6"
            >
              다낭 · 호이안 · 2026.03.20 ~ 03.23
            </motion.p>
          </motion.div>
        )}

        {/* ── Step 2: 10계명 + 서명 ── */}
        {step === "rules" && (
          <motion.div
            key="rules"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-md mx-auto relative z-10"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-8"
            >
              <div className="flex justify-center mb-4">
                <img src="/vacation_3d_icon.png" alt="Vacation Icon" className="w-24 h-24 object-contain drop-shadow-xl" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-1">
                서여사 생신기념 다낭여행
              </h1>
              <p className="text-muted-foreground text-parent">
                서여사 · 이서방과 함께하는 다낭 · 호이안
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="card-base mb-6"
            >
              <h2 className="text-xl font-bold text-center text-foreground mb-5 pb-3 border-b border-border">
                서여사 · 이서방 여행 10계명
              </h2>
              <div className="space-y-3">
                {rules.map((rule, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.08 }}
                    className="flex items-start gap-3"
                  >
                    <span className="text-sm font-semibold text-primary bg-secondary rounded-full w-12 h-7 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {rule.num}
                    </span>
                    <span className="text-parent text-foreground font-medium">
                      {rule.text}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="space-y-4"
            >
              <label className="flex items-start gap-3 cursor-pointer card-base">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => handleAgreeChange(e.target.checked)}
                  className="mt-1 w-7 h-7 rounded accent-primary flex-shrink-0"
                />
                <span className="text-sm text-foreground leading-relaxed">
                  위 10계명을 숙지했으며 즐거운 우리 여행을 위해 준수하겠습니다
                </span>
              </label>

              <AnimatePresence>
                {showSignature && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35 }}
                    className="overflow-hidden"
                  >
                    <div className="card-base space-y-4">
                      <div>
                        <label className="text-sm font-bold text-foreground mb-1.5 block">이름</label>
                        <input
                          type="text"
                          value={signerName}
                          onChange={(e) => setSignerName(e.target.value)}
                          placeholder="이름을 입력하세요"
                          className="w-full text-base font-medium text-foreground bg-secondary/50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-bold text-foreground mb-1.5 block">서명</label>
                        <SignaturePad
                          ref={padRef}
                          onSigned={handleSigned}
                          onClear={handleClearSignature}
                          hasSigned={hasSigned}
                        />
                      </div>
                      {hasSigned && hasName && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs text-primary font-semibold text-center"
                        >
                          서명 완료!
                        </motion.p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={handleShowPledge}
                disabled={!canEnter || isBuilding}
                className="w-full py-4 rounded-2xl text-lg font-bold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]"
              >
                {!agreed
                  ? "먼저 동의해주세요"
                  : !hasName
                  ? "이름을 입력해주세요"
                  : isBuilding
                  ? "서약서 생성 중..."
                  : "서약 완료! ✈️"}
              </button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
              className="text-center text-xs text-muted-foreground mt-6"
            >
              다낭 · 호이안 · 2026.03.20 ~ 03.23
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 서약서 이미지 오버레이 */}
      <AnimatePresence>
        {showPledge && pledgeImageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="w-full max-w-sm flex flex-col items-center gap-4"
            >
              <img
                src={pledgeImageUrl}
                alt="여행 서약서"
                className="w-full rounded-xl shadow-2xl"
              />
              <div className="w-full flex flex-col gap-3">
                <a
                  href={pledgeImageUrl}
                  download={`여행서약서_${new Date().toISOString().slice(0, 10)}.png`}
                  onClick={() => setSaved(true)}
                  className="w-full py-4 rounded-2xl text-lg font-bold bg-white text-primary text-center hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  서약서 저장하기
                </a>
                <button
                  onClick={onEnter}
                  disabled={!saved}
                  className="w-full py-4 rounded-2xl text-lg font-bold bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {saved ? "여행 일정 보기 ✈️" : "먼저 서약서를 저장해주세요"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EntryGate;
