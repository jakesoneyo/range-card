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
  SPAWN_POINT_TYPE_ICON_SVG,
  SPAWN_POINT_TYPE_LABEL,
} from "../../lib/spawnPointMeta";
import { Badge } from "../ui/Badge";

// 마커 색 다이아몬드가 통일감 있게 45도 회전돼 있어서, 안의 아이콘은 반대로 -45도
// 되돌려야 화면에 똑바로 서 보인다. 아이콘 색은 --color-bg(거의 검정) 고정 — 세 마커색
// (골드/블루/레드) 전부 중간 톤이라 어두운 아이콘이 밝은 아이콘보다 대비가 안정적이다.
function buildDivIcon(type: SpawnPoint["type"]) {
  // react-dom/server를 번들에 끌어들이지 않고 문자열로 직접 생성(divIcon은 HTML 문자열만 받음).
  const html = `<span class="relative block h-[22px] w-[22px] rotate-45 border border-ink/80 ${SPAWN_POINT_TYPE_DOT_CLASS[type]}">
    <svg class="absolute inset-0 m-auto h-3 w-3 -rotate-45" viewBox="0 0 24 24" fill="none" stroke="var(--color-bg)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${SPAWN_POINT_TYPE_ICON_SVG[type]}</svg>
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
