import { useState, useEffect, useRef } from "react";
import { useExchangeRate } from "@/hooks/useExchangeRate";

const ExchangeTab = () => {
  const [krwInput, setKrwInput] = useState("");
  const [vndInput, setVndInput] = useState("");
  const { data, isLoading } = useExchangeRate();

  const rate = data?.rate ?? 18.5;
  const isFallback = data?.isFallback ?? true;
  const prevRate = useRef(rate);
  const lastEdited = useRef<"krw" | "vnd">("krw");

  useEffect(() => {
    if (prevRate.current !== rate) {
      if (lastEdited.current === "krw" && krwInput) {
        setVndInput(String(Math.round(Number(krwInput) * rate)));
      } else if (lastEdited.current === "vnd" && vndInput) {
        setKrwInput(String(Math.round(Number(vndInput) / rate)));
      }
    }
    prevRate.current = rate;
  }, [rate, krwInput, vndInput]);

  const formatNum = (n: number) => n.toLocaleString("ko-KR");

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return dateStr.replace(/-/g, ".");
  };

  const handleKrw = (val: string) => {
    lastEdited.current = "krw";
    setKrwInput(val);
    setVndInput(val ? String(Math.round(Number(val) * rate)) : "");
  };

  const handleVnd = (val: string) => {
    lastEdited.current = "vnd";
    setVndInput(val);
    setKrwInput(val ? String(Math.round(Number(val) / rate)) : "");
  };

  const presets = [
    { label: "쌀국수", vnd: 40000 },
    { label: "반미", vnd: 25000 },
    { label: "커피", vnd: 35000 },
    { label: "맥주", vnd: 15000 },
    { label: "마사지 1시간", vnd: 200000 },
    { label: "Grab 택시", vnd: 50000 },
    { label: "코코넛 보트", vnd: 150000 },
    { label: "기념품", vnd: 100000 },
  ];

  return (
    <div className="space-y-4 fade-in">
      {/* Bidirectional converter */}
      <div className="card-base space-y-4">
        <div>
          <label className="text-base font-bold text-foreground mb-2 block">🇰🇷 한국 원 (KRW)</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={krwInput}
            onChange={(e) => handleKrw(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="금액 입력"
            className="w-full text-2xl font-bold text-foreground bg-secondary/50 rounded-xl px-4 py-4 outline-none focus:ring-2 focus:ring-primary/50 min-h-[56px]"
          />
          {krwInput && (
            <p className="text-base text-muted-foreground mt-1">
              = {formatNum(Number(vndInput))} 동
            </p>
          )}
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 h-px bg-border" />
            <span className="text-base font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
              {isLoading ? "환율 로딩중..." : `1원 = ${rate}동`}
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <span className="text-xs text-muted-foreground">
            {!isFallback
              ? `오늘의 환율 · ${formatDate(data!.updatedAt)} 기준`
              : "참고 환율 (실제와 다를 수 있음)"}
          </span>
        </div>

        <div>
          <label className="text-base font-bold text-foreground mb-2 block">🇻🇳 베트남 동 (VND)</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={vndInput}
            onChange={(e) => handleVnd(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="금액 입력"
            className="w-full text-2xl font-bold text-foreground bg-secondary/50 rounded-xl px-4 py-4 outline-none focus:ring-2 focus:ring-primary/50 min-h-[56px]"
          />
          {vndInput && (
            <p className="text-base text-muted-foreground mt-1">
              = {formatNum(Number(krwInput))} 원
            </p>
          )}
        </div>
      </div>

      {/* Quick presets */}
      <div className="card-base">
        <h3 className="text-lg font-bold text-foreground mb-3">🧮 이거 한국 돈으로 얼마?</h3>
        <div className="space-y-2">
          {presets.map((item, i) => (
            <button
              key={i}
              onClick={() => handleVnd(String(item.vnd))}
              className="w-full flex items-center justify-between bg-secondary/50 rounded-xl p-3.5 min-h-[48px] active:scale-[0.98] transition-transform"
            >
              <span className="text-base font-medium text-foreground">{item.label}</span>
              <div className="text-right">
                <span className="text-sm text-muted-foreground">{formatNum(item.vnd)}동</span>
                <span className="text-base font-bold text-primary ml-2">≈ {formatNum(Math.round(item.vnd / rate))}원</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tip */}
      <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20">
        <p className="text-base text-foreground font-medium">
          💡 <strong>꿀팁:</strong> 베트남 동에서 0 하나 빼고 2로 나누면 대략 한국 원!
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          예: 50,000동 → 0 빼면 5,000 → ÷2 = 약 2,500원
        </p>
      </div>
    </div>
  );
};

export default ExchangeTab;
