/**
 * 전역 헤더 — 워드마크(NOOBG, skew 처리)와 페이지 네비게이션.
 * 헤더 하단 골드 그라디언트 언더라인(짧고 좌측 정렬)은 Variant E 형태 언어의 시그니처.
 */
import { NavLink } from "react-router";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-1.5 text-sm uppercase tracking-wide transition-colors ${
    isActive ? "text-accent" : "text-sub hover:text-ink"
  }`;

export function AppHeader() {
  return (
    <header className="relative border-b border-border bg-panel">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <NavLink to="/" className="font-wordmark text-xl text-ink">
          NOOBG
        </NavLink>
        <nav className="flex items-center gap-1">
          <NavLink to="/" className={navLinkClass} end>
            맵 인텔
          </NavLink>
          <NavLink to="/players" className={navLinkClass}>
            전적검색
          </NavLink>
        </nav>
      </div>
      <div className="h-[3px] w-40 bg-gradient-to-r from-accent to-transparent" />
    </header>
  );
}
