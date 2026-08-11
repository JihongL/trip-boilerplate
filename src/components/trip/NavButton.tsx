import type { ReactNode } from "react";
import { Navigation } from "lucide-react";
import type { Place } from "@/config/types";
import { buildNavTargets, buildWebFallbackUrl, openNavTarget, type NavTarget } from "@/lib/nav";
import { useOnline } from "@/hooks/useOnline";
import { cn } from "@/lib/utils";

interface NavButtonProps {
  place: Place;
  name: string;
  /**
   * 폴백 검색에 쓸 주소. **있으면 반드시 넘길 것.**
   * "농막"·"계곡"처럼 이름이 일반명사인 장소는 이름으로 검색하면 엉뚱한 곳이 나온다.
   */
  address?: string;
  /** "full" = 라벨 있는 버튼 행, "icon" = 아이콘 하나 (타임라인 항목용) */
  variant?: "full" | "icon";
  className?: string;
}

interface NavTargetLinkProps {
  target: NavTarget;
  place: Place;
  name: string;
  address?: string;
  className: string;
  children: ReactNode;
}

/**
 * https 링크(카카오맵/구글맵)는 평범한 <a> 로 연다 — 앱 유무와 무관하게
 * 항상 동작하고, 길게 눌러 링크 복사도 가능하다.
 * T맵·네이버지도는 커스텀 스킴(tmap://, nmap://)이라 <a> 만으로는 앱 미설치 시 빈 화면에
 * 갇히므로, openNavTarget() 으로 실행 후 일정 시간 내 전환이 없으면 카카오맵으로 폴백한다.
 * "커스텀 스킴인지"는 URL 이 http(s) 로 시작하지 않는지로 판별해, 개별 앱 이름을 나열하지
 * 않아도 앞으로 스킴 기반 앱이 추가되면 자동으로 같은 처리를 받는다.
 */
function NavTargetLink({ target, place, name, address, className, children }: NavTargetLinkProps) {
  const isCustomScheme = !/^https?:\/\//.test(target.url);

  if (isCustomScheme) {
    return (
      <button
        type="button"
        onClick={() => openNavTarget(target, buildWebFallbackUrl(place, name, address))}
        aria-label={`${name} 길찾기 - ${target.label}`}
        className={className}
      >
        {children}
      </button>
    );
  }

  return (
    <a
      href={target.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${name} 길찾기 - ${target.label}`}
      className={className}
    >
      {children}
    </a>
  );
}

export default function NavButton({ place, name, address, variant = "full", className }: NavButtonProps) {
  const isOnline = useOnline();
  const targets = buildNavTargets(place, name);

  if (targets.length === 0) return null;

  if (variant === "icon") {
    const first = targets[0];
    return (
      <NavTargetLink
        target={first}
        place={place}
        name={name}
        address={address}
        className={cn(
          "inline-flex items-center justify-center min-w-11 min-h-11 w-11 h-11 rounded-xl bg-primary text-primary-foreground active:scale-95 transition-transform flex-shrink-0",
          className
        )}
      >
        <Navigation className="w-5 h-5" aria-hidden="true" />
      </NavTargetLink>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-2" role="group" aria-label={`${name} 길찾기`}>
        {targets.map((target, i) => (
          <NavTargetLink
            key={target.app}
            target={target}
            place={place}
            name={name}
            address={address}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 min-h-11 px-4 rounded-xl text-sm font-bold active:scale-[0.97] transition-transform",
              i === 0
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-secondary-foreground"
            )}
          >
            <Navigation className="w-4 h-4" aria-hidden="true" />
            {target.label}
          </NavTargetLink>
        ))}
      </div>
      {!isOnline && (
        <p className="text-xs text-muted-foreground">
          지도 앱이 오프라인이면 동작하지 않을 수 있어요
        </p>
      )}
    </div>
  );
}
