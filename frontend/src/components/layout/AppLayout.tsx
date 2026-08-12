/**
 * 전역 레이아웃 — 헤더 + 라우트 아웃렛. 다크 전용 배경/텍스트 토큰 적용.
 */
import { Outlet } from "react-router";
import { AppHeader } from "./AppHeader";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <AppHeader />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
