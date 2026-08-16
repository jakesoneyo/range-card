/**
 * 우측 레이어 토글 사이드바 — 고정차량/고정보트/비밀의 방·지하벙커 체크박스 +
 * 박격포 계산기 모드 스위치. 사이드바 배경엔 미세한 대각선 그라디언트(panel-2 → 어두운 톤).
 */
import {
  CarFront,
  Anchor,
  KeyRound,
  Warehouse,
  Plane,
  Fuel,
  Crosshair,
} from "lucide-react";
import { useMapUiStore, type LayerToggles } from "../../stores/mapUiStore";
import type { SpawnPoint } from "../../lib/schemas";
import { LAYER_LABELS, LAYER_TYPE_GROUPS } from "../../lib/spawnPointMeta";
import { LayerEmptyState } from "./LayerEmptyState";
import { Panel } from "../ui/Panel";

// 지도 마커 아이콘(SpawnPointMarker)과 동일한 세트로 통일 — 비밀의 방/지하벙커는
// 둘 다 "열쇠로 들어간다"는 같은 설정이라 KeyRound 하나로 묶는다. 차고집은 지도 마커에선
// CarFront(점선 테두리)를 재사용하지만, 사이드바에서는 고정차량과 시각적으로 헷갈리지
// 않도록 Warehouse를 쓴다. 글라이더는 Plane, 주유소는 Fuel — 둘 다 직관적으로 매칭되는
// 아이콘이 있어 별도 대체 로직 없이 그대로 사용.
const LAYER_ICONS: Record<keyof LayerToggles, typeof CarFront> = {
  vehicleFixed: CarFront,
  boatFixed: Anchor,
  secretBunker: KeyRound,
  garageHouse: Warehouse,
  glider: Plane,
  gasStation: Fuel,
};

const LAYER_KEYS = Object.keys(LAYER_TYPE_GROUPS) as (keyof LayerToggles)[];

export function LayerTogglePanel({
  spawnPoints,
  isLoading,
}: {
  spawnPoints: SpawnPoint[];
  isLoading: boolean;
}) {
  const layers = useMapUiStore((state) => state.layers);
  const toggleLayer = useMapUiStore((state) => state.toggleLayer);
  const mode = useMapUiStore((state) => state.mode);
  const setMode = useMapUiStore((state) => state.setMode);

  return (
    <Panel className="bg-gradient-to-br from-panel-2 to-bg p-4">
      <h2 className="font-wordmark text-sm text-sub">레이어</h2>
      <ul className="mt-3 space-y-3">
        {LAYER_KEYS.map((key) => {
          const Icon = LAYER_ICONS[key];
          const label = LAYER_LABELS[key];
          const types = LAYER_TYPE_GROUPS[key];
          const checked = layers[key];
          const count = spawnPoints.filter((sp) =>
            types.includes(sp.type),
          ).length;
          return (
            <li key={key}>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleLayer(key)}
                  className="accent-accent h-4 w-4"
                />
                <Icon size={16} className="text-sub" />
                {label}
              </label>
              {checked && !isLoading && count === 0 && (
                <div className="mt-1 pl-6">
                  <LayerEmptyState layerLabel={label} />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-5 border-t border-border pt-4">
        <button
          type="button"
          onClick={() => setMode(mode === "mortar" ? "view" : "mortar")}
          className={`font-wordmark clip-corner-sm flex w-full items-center justify-center gap-2 border px-3 py-2 text-sm transition-colors ${
            mode === "mortar"
              ? "border-accent bg-accent/15 text-accent"
              : "border-border bg-panel text-sub hover:text-ink"
          }`}
        >
          <Crosshair size={16} />
          박격포 계산기
        </button>
      </div>
    </Panel>
  );
}
