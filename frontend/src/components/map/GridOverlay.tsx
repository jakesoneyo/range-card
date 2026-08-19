/**
 * PUBG 인게임 콜아웃 그리드(가로 A~H · 세로 1~8, 셀당 1000m) 오버레이.
 * 좌표 데이터를 큐레이션할 때 기준으로 삼았던 바로 그 격자라 별도 변환 없이
 * imageSizePx를 8등분한 선만 그으면 된다. SVGOverlay는 ImageOverlay와 동일한
 * 방식(bounds 상단=lat 최댓값)으로 배치되므로 y축 반전 걱정 없이 이미지 픽셀
 * 좌표를 그대로 viewBox 좌표로 써도 된다.
 *
 * 굵은 1000m 선 안에 얇은 100m 보조선을 추가로 긋는다(실제 인게임 미니맵도 이 세분화가
 * 있음) — 셀 하나(1000m)를 10등분하면 100m 단위가 나오므로 imageSizePx를 80등분.
 * 10번째마다는 이미 굵은 선(=셀 경계)과 겹치므로 그 위치만 건너뛴다.
 */
import { SVGOverlay } from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";

const GRID_SIZE = 8;
const FINE_DIVISIONS_PER_CELL = 10;
const FINE_GRID_SIZE = GRID_SIZE * FINE_DIVISIONS_PER_CELL;
const COLUMN_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export function GridOverlay({ imageSizePx }: { imageSizePx: number }) {
  const bounds: LatLngBoundsExpression = [
    [0, 0],
    [imageSizePx, imageSizePx],
  ];
  const cell = imageSizePx / GRID_SIZE;
  const fineCell = imageSizePx / FINE_GRID_SIZE;
  const strokeWidth = imageSizePx * 0.0012;
  const fineStrokeWidth = imageSizePx * 0.0005;
  const labelSize = cell * 0.14;
  const labelInset = labelSize * 0.9;

  const dividers = [];
  for (let i = 1; i < GRID_SIZE; i++) {
    const pos = i * cell;
    dividers.push(
      <line key={`v${i}`} x1={pos} y1={0} x2={pos} y2={imageSizePx} />,
      <line key={`h${i}`} x1={0} y1={pos} x2={imageSizePx} y2={pos} />,
    );
  }

  const fineDividers = [];
  for (let i = 1; i < FINE_GRID_SIZE; i++) {
    if (i % FINE_DIVISIONS_PER_CELL === 0) continue; // 셀 경계는 굵은 선이 이미 그림
    const pos = i * fineCell;
    fineDividers.push(
      <line key={`fv${i}`} x1={pos} y1={0} x2={pos} y2={imageSizePx} />,
      <line key={`fh${i}`} x1={0} y1={pos} x2={imageSizePx} y2={pos} />,
    );
  }

  return (
    <SVGOverlay
      bounds={bounds}
      attributes={{ viewBox: `0 0 ${imageSizePx} ${imageSizePx}` }}
    >
      <g
        stroke="var(--color-accent)"
        strokeOpacity={0.15}
        strokeWidth={fineStrokeWidth}
        className="pointer-events-none"
      >
        {fineDividers}
      </g>
      <g
        stroke="var(--color-accent)"
        strokeOpacity={0.4}
        strokeWidth={strokeWidth}
        className="pointer-events-none"
      >
        {dividers}
      </g>
      <g
        fill="var(--color-accent)"
        fillOpacity={0.75}
        fontFamily="var(--font-mono)"
        fontSize={labelSize}
        className="pointer-events-none select-none"
      >
        {COLUMN_LABELS.map((label, i) => (
          <text
            key={`col${label}`}
            x={i * cell + labelInset}
            y={labelInset + labelSize * 0.7}
            textAnchor="middle"
          >
            {label}
          </text>
        ))}
        {COLUMN_LABELS.map((_, i) => (
          <text
            key={`row${i + 1}`}
            x={labelInset}
            y={i * cell + labelInset + labelSize * 0.7}
            textAnchor="middle"
          >
            {i + 1}
          </text>
        ))}
      </g>
    </SVGOverlay>
  );
}
