import { useState, useEffect, useRef } from "react";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { tripConfig } from "@/config/trip";

const ex = tripConfig.exchange;

const ExchangeTab = () => {
  const [krwInput, setKrwInput] = useState("");
  const [vndInput, setVndInput] = useState("");
  const { data, isLoading } = useExchangeRate();

  const rate = data?.rate ?? ex.fallbackRate;
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

  const presets = ex.localPrices.map((p) => ({ label: p.label, vnd: p.amount }));

  return (
    <div className="space-y-4 fade-in">
      {/* Bidirectional converter */}
      <div className="card-base space-y-4">
        <div>
          <label className="text-base font-bold text-foreground mb-2 block">{ex.fromFlag} {ex.fromName} ({ex.from.toUpperCase()})</label>
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
              = {formatNum(Number(vndInput))} {ex.toUnit}
            </p>
          )}
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 h-px bg-border" />
            <span className="text-base font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
              {isLoading ? "환율 로딩중..." : `1${ex.fromUnit} = ${rate}${ex.toUnit}`}
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
          <label className="text-base font-bold text-foreground mb-2 block">{ex.toFlag} {ex.toName} ({ex.to.toUpperCase()})</label>
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
              = {formatNum(Number(krwInput))} {ex.fromUnit}
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
                <span className="text-sm text-muted-foreground">{formatNum(item.vnd)}{ex.toUnit}</span>
                <span className="text-base font-bold text-primary ml-2">≈ {formatNum(Math.round(item.vnd / rate))}{ex.fromUnit}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tip */}
      <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20">
        <p className="text-base text-foreground font-medium">
          💡 <strong>꿀팁:</strong> {ex.tip.main}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {ex.tip.example}
        </p>
      </div>
    </div>
  );
};

export default ExchangeTab;
