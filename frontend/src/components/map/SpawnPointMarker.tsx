/**
 * 스폰 포인트 1개를 지도 위 마커로 렌더링. 타입별 색상 아이콘(배경 배지 없음) + 상세 팝업.
 * Leaflet Marker는 컴포넌트 아이콘을 직접 지원하지 않아 divIcon HTML로 렌더링한다.
 */
import { useMemo } from "react";
import L from "leaflet";
import { Marker, Popup } from "react-leaflet";
import { pixelToLatLng } from "../../lib/geo";
import type { SpawnPoint } from "../../lib/schemas";
import {
  SPAWN_POINT_TYPE_BADGE_TONE,
  SPAWN_POINT_TYPE_ICON_COLOR_VAR,
  SPAWN_POINT_TYPE_ICON_OPACITY,
  SPAWN_POINT_TYPE_ICON_SVG,
  SPAWN_POINT_TYPE_LABEL,
} from "../../lib/spawnPointMeta";
import { Badge } from "../ui/Badge";

// 배경 배지(색 다이아몬드) 없이 타입색 아이콘만 그린다 — 지형을 가리는 면적을 최소화하기
// 위한 선택(마커 스타일 후보 비교 후 확정). 클릭 히트박스는 여전히 22x22 유지(iconSize는
// 그대로라 실제 눌리는 영역은 안 줄어듦, 시각적으로만 가벼워짐). 어두운 지형 위에서도
// 보이도록 drop-shadow로 대비를 확보한다. GARAGE_HOUSE만 반투명 — "100% 고정 아님"을
// 형태(예전엔 점선 테두리) 대신 옅은 아이콘으로 구분한다.
function buildDivIcon(type: SpawnPoint["type"]) {
  // react-dom/server를 번들에 끌어들이지 않고 문자열로 직접 생성(divIcon은 HTML 문자열만 받음).
  const html = `<span class="flex h-[22px] w-[22px] items-center justify-center">
    <svg class="h-[18px] w-[18px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]" style="opacity:${SPAWN_POINT_TYPE_ICON_OPACITY[type]}" viewBox="0 0 24 24" fill="none" stroke="${SPAWN_POINT_TYPE_ICON_COLOR_VAR[type]}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${SPAWN_POINT_TYPE_ICON_SVG[type]}</svg>
  </span>`;
  return L.divIcon({
    html,
    className: "",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

export function SpawnPointMarker({
  spawnPoint,
  imageSizePx,
}: {
  spawnPoint: SpawnPoint;
  imageSizePx: number;
}) {
  const icon = useMemo(() => buildDivIcon(spawnPoint.type), [spawnPoint.type]);
  const latlng = pixelToLatLng(spawnPoint.x, spawnPoint.y, imageSizePx);

  return (
    <Marker position={[latlng.lat, latlng.lng]} icon={icon}>
      <Popup>
        <div className="font-body space-y-1.5 text-sm">
          <Badge tone={SPAWN_POINT_TYPE_BADGE_TONE[spawnPoint.type]}>
            {SPAWN_POINT_TYPE_LABEL[spawnPoint.type]}
          </Badge>
          <p className="font-semibold text-ink">{spawnPoint.label}</p>
          {spawnPoint.description && (
            <p className="text-sub">{spawnPoint.description}</p>
          )}
          {spawnPoint.sourceUrl && (
            <a
              href={spawnPoint.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="block text-accent underline"
            >
              출처 보기
            </a>
          )}
        </div>
      </Popup>
    </Marker>
  );
}
