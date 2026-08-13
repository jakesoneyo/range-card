/**
 * 스폰 포인트 1개를 지도 위 마커로 렌더링. 타입별 색상 다이아몬드 아이콘 + 상세 팝업.
 * Leaflet Marker는 컴포넌트 아이콘을 직접 지원하지 않아 divIcon HTML로 렌더링한다.
 */
import { useMemo } from "react";
import L from "leaflet";
import { Marker, Popup } from "react-leaflet";
import { pixelToLatLng } from "../../lib/geo";
import type { SpawnPoint } from "../../lib/schemas";
import {
  SPAWN_POINT_TYPE_BADGE_TONE,
  SPAWN_POINT_TYPE_DOT_CLASS,
  SPAWN_POINT_TYPE_LABEL,
} from "../../lib/spawnPointMeta";
import { Badge } from "../ui/Badge";

function buildDivIcon(type: SpawnPoint["type"]) {
  // 마커 아이콘 span 하나뿐이라 react-dom/server를 번들에 끌어들이는 대신 문자열로 직접 생성.
  const html = `<span class="block h-3.5 w-3.5 rotate-45 border border-ink/80 ${SPAWN_POINT_TYPE_DOT_CLASS[type]}"></span>`;
  return L.divIcon({
    html,
    className: "",
    iconSize: [14, 14],
    iconAnchor: [7, 7],
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
