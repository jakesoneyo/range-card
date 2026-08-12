/**
 * 라우트 정의. 일반 사용자는 로그인 개념 없이 바로 맵 선택/전적검색을 사용한다 —
 * 관리자 인증은 전용 라우트 없이 MapViewerPage 내 모달로만 진입.
 * MapViewerPage는 Leaflet(무거운 지도 라이브러리)을 물고 있어 lazy 로드로 분리 —
 * 전적검색 페이지만 방문하는 사용자가 지도 번들까지 받지 않게 한다.
 */
import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router";
import { AppLayout } from "./components/layout/AppLayout";
import { MapSelectPage } from "./pages/MapSelectPage";
import { PlayerSearchPage } from "./pages/PlayerSearchPage";

const MapViewerPage = lazy(() =>
  import("./pages/MapViewerPage").then((m) => ({ default: m.MapViewerPage })),
);

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<MapSelectPage />} />
        <Route
          path="maps/:slug"
          element={
            <Suspense
              fallback={<p className="p-10 text-sm text-sub">불러오는 중...</p>}
            >
              <MapViewerPage />
            </Suspense>
          }
        />
        <Route path="players" element={<PlayerSearchPage />} />
      </Route>
    </Routes>
  );
}
