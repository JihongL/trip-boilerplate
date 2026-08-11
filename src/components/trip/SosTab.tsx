import type { ReactNode } from "react";
import type { Contact } from "@/config/types";
import { tripConfig } from "@/config/trip";
import NavButton from "./NavButton";

/**
 * 국내(강원도) 자차 여행용 SOS 탭.
 * 양양 갈천리 · 평창 진부면은 산간이라 통신이 끊길 수 있으므로,
 * 이 탭 전체는 어떤 fetch 도 하지 않고 config 에 담긴 값만으로 완전히 동작한다.
 */

const sos = tripConfig.sos;
const stays = tripConfig.stays;

/** "033-630-6190", "1588-2504" 처럼 숫자와 하이픈으로만 이루어진 경우에만 실제 전화번호로 취급한다. */
function isPhoneNumber(value: string): boolean {
  return /^[0-9-]+$/.test(value.trim());
}

function toTelHref(value: string): string {
  return `tel:${value.replace(/[^+\d]/g, "")}`;
}

function ContactRow({ contact }: { contact: Contact }) {
  const phone = isPhoneNumber(contact.number);

  const inner = (
    <>
      <div className="min-w-0 flex-1">
        <p className="text-base font-bold text-foreground">{contact.label}</p>
        {contact.note && <p className="text-sm text-muted-foreground mt-0.5">{contact.note}</p>}
        {!phone && <p className="text-sm text-foreground mt-1">{contact.number}</p>}
      </div>
      {phone && <span className="text-base font-bold text-primary whitespace-nowrap flex-shrink-0">📞 전화</span>}
    </>
  );

  if (phone) {
    return (
      <a
        href={toTelHref(contact.number)}
        className="flex items-center justify-between gap-3 bg-secondary/50 rounded-xl p-4 min-h-[56px] active:scale-[0.98] transition-transform"
      >
        {inner}
      </a>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 bg-secondary/50 rounded-xl p-4 min-h-[56px]">
      {inner}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="card-base">
      <h3 className="text-lg font-bold text-foreground mb-3">{title}</h3>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

const SosTab = () => {
  return (
    <div className="space-y-4 fade-in">
      {/* 긴급 신고 — 가장 크고 누르기 쉬운 버튼, 오프라인에서도 항상 동작 */}
      <div className="space-y-3">
        {sos.emergency.map((item, i) => (
          <a
            key={i}
            href={`tel:${item.number}`}
            className="flex items-center gap-4 bg-destructive text-destructive-foreground rounded-2xl p-5 min-h-[64px] shadow-sm active:scale-[0.97] transition-transform"
          >
            <span className="text-4xl" aria-hidden="true">{item.emoji}</span>
            <div className="flex-1">
              <p className="text-xl font-bold">{item.label}</p>
              <p className="text-base opacity-90">{item.sublabel}</p>
            </div>
            <span className="text-2xl font-bold bg-white/20 px-5 py-3 rounded-2xl">📞</span>
          </a>
        ))}
      </div>

      {/* 위급 상황 대응 절차 */}
      {sos.emergencySteps.length > 0 && (
        <div className="bg-sand/15 rounded-2xl p-4 border border-sand/30">
          <h3 className="text-lg font-bold text-foreground mb-3">위급할 때 이렇게 하세요</h3>
          <ol className="space-y-2">
            {sos.emergencySteps.map((step, i) => (
              <li key={i} className="flex gap-3 items-center">
                <span className="bg-sand-deep text-white font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-base">
                  {i + 1}
                </span>
                <span className="text-base font-medium text-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* 자차 여행용 — 도로 위 도움 */}
      {sos.roadside.length > 0 && (
        <Section title="🚗 도로 위 도움">
          {sos.roadside.map((c, i) => (
            <ContactRow key={i} contact={c} />
          ))}
        </Section>
      )}

      {/* 숙소 위치 — 119에 위치를 불러줘야 할 때 오프라인에서도 확인 가능해야 함 */}
      {stays.length > 0 && (
        <Section title="🏡 숙소 위치">
          <div className="space-y-3">
            {stays.map((stay, i) => (
              <div key={i} className="bg-secondary/50 rounded-xl p-4 space-y-2">
                <div>
                  <p className="text-base font-bold text-foreground">{stay.name}</p>
                  <p className="text-sm text-muted-foreground">{stay.address}</p>
                </div>
                <NavButton place={stay.place} name={stay.name} variant="full" />
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* 숙소 연락처 */}
      {sos.stayContacts.length > 0 && (
        <Section title="📞 숙소 연락처">
          {sos.stayContacts.map((c, i) => (
            <ContactRow key={i} contact={c} />
          ))}
        </Section>
      )}

      {/* 병원 */}
      {sos.hospitals.length > 0 && (
        <Section title="🏥 병원">
          {sos.hospitals.map((c, i) => (
            <ContactRow key={i} contact={c} />
          ))}
        </Section>
      )}

      {/* ↓ 해외 전용, 값이 있을 때만 렌더 (이번 국내 여행은 해당 없음) */}
      {sos.consulate && sos.consulate.length > 0 && (
        <Section title="🇰🇷 영사관">
          {sos.consulate.map((item, i) => (
            <a
              key={i}
              href={`tel:${item.number.replace(/[^+\d]/g, "")}`}
              className="flex items-center gap-4 bg-secondary/50 rounded-xl p-4 min-h-[56px] active:scale-[0.98] transition-transform"
            >
              <span className="text-2xl" aria-hidden="true">{item.emoji}</span>
              <div className="flex-1">
                <p className="text-base font-bold text-foreground">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.sublabel}</p>
              </div>
              <span className="text-sm font-bold text-primary whitespace-nowrap">📞 전화</span>
            </a>
          ))}
        </Section>
      )}

      {sos.lostPassportSteps && sos.lostPassportSteps.length > 0 && (
        <Section title="🛂 여권 분실 시">
          <ol className="space-y-2 text-base text-foreground list-decimal list-inside">
            {sos.lostPassportSteps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </Section>
      )}

      {sos.hospitalVisitInfo && sos.hospitalVisitInfo.length > 0 && (
        <Section title="🏥 병원 갈 때 필요한 정보">
          <ul className="space-y-2 text-base text-foreground list-disc list-inside">
            {sos.hospitalVisitInfo.map((info, i) => (
              <li key={i}>{info}</li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
};

export default SosTab;
