/**
 * 맵 뷰어 — 지도 + 레이어 토글 + 박격포 계산기 + (로그인 시) 관리자 편집.
 * 관리자 인증은 전용 라우트 없이 구석 자물쇠 아이콘 → AdminLoginModal로만 진입한다.
 */
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import { useMap } from "../api/maps";
import { usePublicSpawnPoints } from "../api/spawnPoints";
import { useMapUiStore } from "../stores/mapUiStore";
import { useAdminAuthStore } from "../stores/adminAuth.store";
import { LAYER_TYPE_GROUPS } from "../lib/spawnPointMeta";
import type { PixelPoint } from "../lib/geo";
import { MapCanvas } from "../components/map/MapCanvas";
import { LayerTogglePanel } from "../components/map/LayerTogglePanel";
import { MortarCalculatorPanel } from "../components/map/MortarCalculatorPanel";
import { AdminLoginModal } from "../components/map/AdminLoginModal";
import { AdminEditPanel } from "../components/map/AdminEditPanel";

export function MapViewerPage() {
  const { slug } = useParams<{ slug: string }>();
  const {
    data: map,
    isLoading: isMapLoading,
    isError: isMapError,
  } = useMap(slug);

  const layers = useMapUiStore((state) => state.layers);
  const mode = useMapUiStore((state) => state.mode);
  const setMode = useMapUiStore((state) => state.setMode);
  const registerMortarClick = useMapUiStore(
    (state) => state.registerMortarClick,
  );
  const setPendingAdminPoint = useMapUiStore(
    (state) => state.setPendingAdminPoint,
  );

  const token = useAdminAuthStore((state) => state.token);
  const logout = useAdminAuthStore((state) => state.logout);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);

  const activeTypes = useMemo(
    () =>
      (
        Object.keys(LAYER_TYPE_GROUPS) as (keyof typeof LAYER_TYPE_GROUPS)[]
      ).flatMap((key) => (layers[key] ? LAYER_TYPE_GROUPS[key] : [])),
    [layers],
  );

  const { data: spawnPoints = [], isLoading: isSpawnPointsLoading } =
    usePublicSpawnPoints(map?.slug, activeTypes);

  function handleMapClick(point: PixelPoint) {
    if (mode === "mortar") registerMortarClick(point);
    if (mode === "admin-edit") setPendingAdminPoint(point);
  }

  function handleLockClick() {
    if (!token) {
      setLoginModalOpen(true);
      return;
    }
    setMode(mode === "admin-edit" ? "view" : "admin-edit");
  }

  if (isMapLoading) {
    return <p className="p-10 text-sm text-sub">지도를 불러오는 중...</p>;
  }
  if (isMapError || !map) {
    return (
      <div className="p-10">
        <p className="text-sm text-marker-secret">
          지도를 불러오지 못했습니다.
        </p>
        <Link
          to="/"
          className="mt-2 inline-block text-sm text-accent underline"
        >
          맵 선택으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-sub hover:text-ink">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="font-wordmark text-2xl text-ink">{map.name}</h1>
        </div>
        <button
          type="button"
          onClick={handleLockClick}
          title={token ? "관리자 편집 모드 전환" : "관리자 로그인"}
          className={`clip-corner-sm border p-2 transition-colors ${
            mode === "admin-edit"
              ? "border-accent bg-accent/15 text-accent"
              : "border-border bg-panel text-sub hover:text-ink"
          }`}
        >
          {token ? <ShieldCheck size={16} /> : <Lock size={16} />}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
        <div className="h-[70vh] min-h-[420px]">
          <MapCanvas
            map={map}
            spawnPoints={spawnPoints}
            onPixelClick={handleMapClick}
          />
        </div>
        <aside>
          <LayerTogglePanel
            spawnPoints={spawnPoints}
            isLoading={isSpawnPointsLoading}
          />
          <MortarCalculatorPanel map={map} />
          {token && mode === "admin-edit" && (
            <AdminEditPanel map={map} token={token} />
          )}
          {token && (
            <button
              type="button"
              onClick={logout}
              className="mt-4 w-full text-center text-xs text-sub hover:text-ink"
            >
              관리자 로그아웃
            </button>
          )}
        </aside>
      </div>

      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </div>
  );
}
