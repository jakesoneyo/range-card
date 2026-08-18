/**
 * 헤더 아래 맵 전환 탭바. 별도 맵 선택 화면 없이 여기서 4개 맵을 즉시 전환한다
 * (에란겔 기본 진입 — App.tsx 라우팅 참고).
 */
import { NavLink } from "react-router";
import { useMaps } from "../../api/maps";

export function MapTabBar() {
  const { data: maps = [], isLoading } = useMaps();

  if (isLoading || maps.length === 0) {
    return <div className="h-9" />;
  }

  return (
    <nav className="flex flex-wrap gap-2">
      {maps.map((map) => (
        <NavLink
          key={map.slug}
          to={`/maps/${map.slug}`}
          className={({ isActive }) =>
            `clip-corner-sm border px-4 py-1.5 text-sm uppercase tracking-wide transition-colors ${
              isActive
                ? "border-accent bg-accent/15 text-accent"
                : "border-border bg-panel text-sub hover:text-ink"
            }`
          }
        >
          {map.name}
        </NavLink>
      ))}
    </nav>
  );
}
