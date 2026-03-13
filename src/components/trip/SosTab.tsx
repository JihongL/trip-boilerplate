import { useState } from "react";
import { tripConfig } from "@/config/trip";

const sos = tripConfig.sos;

const SosTab = () => {
  const [showAll, setShowAll] = useState(false);

  return (
    <div className="space-y-4 fade-in">
      {/* BIG EMERGENCY BUTTONS - visible immediately */}
      <div className="space-y-3">
        {sos.emergency.map((item, i) => (
          <a
            key={i}
            href={`tel:${item.number}`}
            className="card-sos flex items-center gap-4 active:scale-[0.97] transition-transform"
          >
            <span className="text-4xl">{item.emoji}</span>
            <div className="flex-1">
              <p className="text-xl font-bold text-red-700">{item.label}</p>
              <p className="text-base text-red-600">{item.sublabel}</p>
            </div>
            <span className="text-2xl font-bold text-white bg-red-500 px-5 py-3 rounded-2xl">📞</span>
          </a>
        ))}

        {sos.consulate.map((item, i) => (
          <a
            key={i}
            href={`tel:${item.number.replace(/[^+\d]/g, "")}`}
            className="card-base border-2 border-blue-300 flex items-center gap-4 active:scale-[0.97] transition-transform"
          >
            <span className="text-4xl">{item.emoji}</span>
            <div className="flex-1">
              <p className="text-lg font-bold text-foreground">{item.label}</p>
              <p className="text-base text-muted-foreground">{item.sublabel}</p>
            </div>
            <span className="text-2xl font-bold text-white bg-blue-500 px-5 py-3 rounded-2xl">📞</span>
          </a>
        ))}
      </div>

      {/* Quick action guide */}
      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
        <h3 className="text-lg font-bold text-amber-800 mb-3">위급할 때 이렇게 하세요</h3>
        <div className="space-y-2">
          {sos.emergencySteps.map((step, i) => (
            <div key={i} className="flex gap-3 items-center">
              <span className="bg-amber-500 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-base">
                {i + 1}
              </span>
              <span className="text-base font-medium text-foreground">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Show more toggle */}
      <button
        onClick={() => setShowAll(!showAll)}
        className="w-full card-base text-center active:scale-[0.98] transition-transform"
      >
        <span className="text-base font-bold text-primary">
          {showAll ? "접기 ▲" : "연락처 전체 보기 ▼"}
        </span>
      </button>

      {showAll && (
        <div className="space-y-4 fade-in">
          {/* Hospital */}
          <div className="card-base">
            <h3 className="text-lg font-bold text-foreground mb-3">🏥 병원</h3>
            <div className="space-y-2.5">
              {sos.hospitals.map((item, i) => (
                <a
                  key={i}
                  href={`tel:${item.number.replace(/[^+\d]/g, "")}`}
                  className="flex items-center justify-between bg-secondary/50 rounded-xl p-4 min-h-[56px] active:scale-[0.98] transition-transform"
                >
                  <div>
                    <p className="text-base font-bold text-foreground">{item.label}</p>
                    {item.note && <p className="text-sm text-muted-foreground">{item.note}</p>}
                  </div>
                  <span className="text-base font-bold text-primary whitespace-nowrap">📞 전화</span>
                </a>
              ))}
            </div>
          </div>

          {/* Korean embassy */}
          <div className="card-base">
            <h3 className="text-lg font-bold text-foreground mb-3">🇰🇷 한국 관련</h3>
            <div className="space-y-2.5">
              {sos.koreanContacts.map((item, i) => (
                <a
                  key={i}
                  href={`tel:${item.number.replace(/[^+\d]/g, "")}`}
                  className="flex items-center justify-between bg-secondary/50 rounded-xl p-4 min-h-[56px] active:scale-[0.98] transition-transform"
                >
                  <p className="text-base font-bold text-foreground">{item.label}</p>
                  <span className="text-base font-bold text-primary whitespace-nowrap">📞 전화</span>
                </a>
              ))}
            </div>
          </div>

          {/* Hotel + Airline */}
          <div className="card-base">
            <h3 className="text-lg font-bold text-foreground mb-3">🏨 호텔 · ✈️ 항공사</h3>
            <div className="space-y-2.5">
              {sos.hotelAirline.map((item, i) => (
                <a
                  key={i}
                  href={`tel:${item.number.replace(/[^+\d]/g, "")}`}
                  className="flex items-center justify-between bg-secondary/50 rounded-xl p-4 min-h-[56px] active:scale-[0.98] transition-transform"
                >
                  <p className="text-base font-bold text-foreground">{item.label}</p>
                  <span className="text-base font-bold text-primary whitespace-nowrap">📞 전화</span>
                </a>
              ))}
            </div>
          </div>

          {/* Passport lost */}
          <div className="card-base">
            <h3 className="text-lg font-bold text-foreground mb-3">🛂 여권 분실 시</h3>
            <ol className="space-y-2 text-base text-foreground">
              {sos.lostPassportSteps.map((step, i) => (
                <li key={i}>{i + 1}. {step}</li>
              ))}
              <li className="text-red-600 font-bold">💡 여권 사본을 사진으로 저장해두세요!</li>
            </ol>
          </div>

          {/* Hospital visit info */}
          <div className="card-base">
            <h3 className="text-lg font-bold text-foreground mb-3">🏥 병원 갈 때 필요한 정보</h3>
            <ul className="space-y-2 text-base text-foreground">
              {sos.hospitalVisitInfo.map((info, i) => (
                <li key={i}>{info}</li>
              ))}
            </ul>
          </div>

          {/* Hotel help */}
          <div className="card-base">
            <h3 className="text-lg font-bold text-foreground mb-3">🏨 호텔에 도움 요청하는 법</h3>
            <div className="space-y-2 text-base text-foreground">
              <p>📞 객실 전화로 프론트 (보통 0번)</p>
              <p>🚶 직접 프론트 데스크 방문</p>
              <p>🗣️ "I need help" / "Emergency" 라고 말하기</p>
              <p className="text-primary font-bold">💡 호텔 직원이 가장 빠른 도움을 줄 수 있습니다</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SosTab;
