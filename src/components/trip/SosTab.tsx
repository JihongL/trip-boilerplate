import { useState } from "react";

const SosTab = () => {
  const [showAll, setShowAll] = useState(false);

  return (
    <div className="space-y-4 fade-in">
      {/* BIG EMERGENCY BUTTONS - visible immediately */}
      <div className="space-y-3">
        <a
          href="tel:115"
          className="card-sos flex items-center gap-4 active:scale-[0.97] transition-transform"
        >
          <span className="text-4xl">🚑</span>
          <div className="flex-1">
            <p className="text-xl font-bold text-red-700">구급차 / 병원</p>
            <p className="text-base text-red-600">115 바로 전화</p>
          </div>
          <span className="text-2xl font-bold text-white bg-red-500 px-5 py-3 rounded-2xl">📞</span>
        </a>

        <a
          href="tel:113"
          className="card-sos flex items-center gap-4 active:scale-[0.97] transition-transform"
        >
          <span className="text-4xl">🚔</span>
          <div className="flex-1">
            <p className="text-xl font-bold text-red-700">경찰</p>
            <p className="text-base text-red-600">113 바로 전화</p>
          </div>
          <span className="text-2xl font-bold text-white bg-red-500 px-5 py-3 rounded-2xl">📞</span>
        </a>

        <a
          href="tel:+82-2-3210-0404"
          className="card-base border-2 border-blue-300 flex items-center gap-4 active:scale-[0.97] transition-transform"
        >
          <span className="text-4xl">🇰🇷</span>
          <div className="flex-1">
            <p className="text-lg font-bold text-foreground">영사콜센터 (24시간)</p>
            <p className="text-base text-muted-foreground">+82-2-3210-0404</p>
          </div>
          <span className="text-2xl font-bold text-white bg-blue-500 px-5 py-3 rounded-2xl">📞</span>
        </a>
      </div>

      {/* Quick action guide */}
      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
        <h3 className="text-lg font-bold text-amber-800 mb-3">위급할 때 이렇게 하세요</h3>
        <div className="space-y-2">
          {[
            "안전한 곳으로 이동",
            "호텔 프론트에 연락 (가장 빠른 도움)",
            "위의 전화 버튼으로 연락",
            "가족 연락망으로 연락",
          ].map((step, i) => (
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
              {[
                { label: "호이안 종합병원", number: "+84-235-3861-364", note: "Hoi An General Hospital" },
                { label: "다낭 패밀리 메디컬", number: "+84-236-3582-700", note: "외국인 진료 가능" },
              ].map((item, i) => (
                <a
                  key={i}
                  href={`tel:${item.number.replace(/[^+\d]/g, "")}`}
                  className="flex items-center justify-between bg-secondary/50 rounded-xl p-4 min-h-[56px] active:scale-[0.98] transition-transform"
                >
                  <div>
                    <p className="text-base font-bold text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.note}</p>
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
              {[
                { label: "다낭 한국총영사관", number: "+84-236-3556-225" },
                { label: "주베트남 한국대사관", number: "+84-24-3831-5110" },
              ].map((item, i) => (
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
              {[
                { label: "Little Oasis Hotel (호이안)", number: "+84-235-3939-939" },
                { label: "Novotel Danang (다낭)", number: "+84-236-3929-999" },
                { label: "대한항공 고객센터", number: "1588-2001" },
                { label: "대한항공 다낭", number: "+84-236-3583-398" },
              ].map((item, i) => (
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
              <li>1. 가까운 경찰서에서 분실 신고서 발급</li>
              <li>2. 다낭 한국총영사관 방문</li>
              <li>3. 여행증명서(여권 대용) 발급</li>
              <li>4. 여권 사본, 사진 2매 필요</li>
              <li className="text-red-600 font-bold">💡 여권 사본을 사진으로 저장해두세요!</li>
            </ol>
          </div>

          {/* Hospital visit info */}
          <div className="card-base">
            <h3 className="text-lg font-bold text-foreground mb-3">🏥 병원 갈 때 필요한 정보</h3>
            <ul className="space-y-2 text-base text-foreground">
              <li>🛂 여권 원본</li>
              <li>📋 여행자 보험 증서</li>
              <li>💊 복용 중인 약 정보</li>
              <li>🩸 혈액형 정보</li>
              <li>📱 보험사 긴급 연락처</li>
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
