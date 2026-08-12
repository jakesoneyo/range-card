/**
 * 박격포 계산기 패널 — 계산 모드일 때만 표시. 지도 두 번 클릭(발사점→목표점)으로
 * 사거리를 판정한다. 순수 프론트 계산(lib/mortar.ts)이라 서버 왕복이 없다.
 */
import { RotateCcw } from "lucide-react";
import { useMapUiStore } from "../../stores/mapUiStore";
import { calculateMortarRange } from "../../lib/mortar";
import type { MapEntity } from "../../lib/schemas";
import { Panel } from "../ui/Panel";
import { MortarResultCard } from "./MortarResultCard";

export function MortarCalculatorPanel({ map }: { map: MapEntity }) {
  const mode = useMapUiStore((state) => state.mode);
  const mortarPointA = useMapUiStore((state) => state.mortarPointA);
  const mortarPointB = useMapUiStore((state) => state.mortarPointB);
  const resetMortarPoints = useMapUiStore((state) => state.resetMortarPoints);

  if (mode !== "mortar") return null;

  const metersPerPixel = map.sizeM / map.imageSizePx;
  const result =
    mortarPointA && mortarPointB
      ? calculateMortarRange(mortarPointA, mortarPointB, metersPerPixel)
      : null;

  return (
    <Panel className="mt-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-wordmark text-sm text-sub">사거리 계산</h2>
        <button
          type="button"
          onClick={resetMortarPoints}
          className="flex items-center gap-1 text-xs text-sub hover:text-ink"
        >
          <RotateCcw size={13} />
          초기화
        </button>
      </div>

      {!mortarPointA && (
        <p className="mt-2 text-sm text-sub">
          지도에서 발사 지점을 클릭하세요.
        </p>
      )}
      {mortarPointA && !mortarPointB && (
        <p className="mt-2 text-sm text-sub">이제 목표 지점을 클릭하세요.</p>
      )}
      {result && <MortarResultCard result={result} />}
    </Panel>
  );
}
