/**
 * 스폰 포인트 1개를 지도 위 마커로 렌더링. 타입별 색상 물방울 핀(BGMS 스타일 — 뾰족한 끝이
 * 정확한 지점을 가리킴) + 상세 팝업. Leaflet Marker는 컴포넌트 아이콘을 직접 지원하지 않아
 * divIcon HTML로 렌더링한다.
 *
 * 핀 모양은 실제 라이브 지도 위에 여러 후보(클래식 물방울/각진 방패형/미니멀 핀닷 등)를
 * 얹어보고 비교해서 확정했다 — 배경을 옅은 색 틴트+외곽선만 남기고 채움을 거의 비워
 * 밑에 깔린 지형이 최대한 드러나게 했다. 스크린샷은 captures/pin-design-candidates/에 보관.
 *
 * 관리자 편집모드(로그인 + admin-edit)에서는 마커가 드래그 가능해지고, 놓는 순간 새 좌표로
 * PATCH 요청을 보낸다 — 기존엔 삭제 후 재생성밖에 방법이 없던 걸 대체하는 재배치 기능.
 * MapCanvas/MapViewerPage를 거치지 않고 이 컴포넌트가 직접 두 스토어(mapUiStore·adminAuth)를
 * 구독하는 편이 프롭 드릴링보다 단순하다(LayerTogglePanel 등 다른 컴포넌트와 같은 패턴).
 */
import { useMemo } from "react";
import L from "leaflet";
import { Marker, Popup } from "react-leaflet";
import { latLngToPixel, pixelToLatLng } from "../../lib/geo";
import type { SpawnPoint } from "../../lib/schemas";
import { useUpdateSpawnPoint } from "../../api/spawnPoints";
import { useMapUiStore } from "../../stores/mapUiStore";
import { useAdminAuthStore } from "../../stores/adminAuth.store";
import {
  SPAWN_POINT_TYPE_BADGE_TONE,
  SPAWN_POINT_TYPE_ICON_COLOR_VAR,
  SPAWN_POINT_TYPE_ICON_OPACITY,
  SPAWN_POINT_TYPE_ICON_SVG,
  SPAWN_POINT_TYPE_LABEL,
} from "../../lib/spawnPointMeta";
import { Badge } from "../ui/Badge";

// 물방울 외곽선 + 타입색 옅은 틴트(채움은 살짝만, 지형이 비쳐 보이게). 뾰족한 끝(iconAnchor
// 하단 중앙)이 실제 좌표 지점이다 — 아이콘 중심이 지점이던 기존 방식보다 "정확한 한 곳"이라는
// 느낌이 분명해진다.
function buildDivIcon(type: SpawnPoint["type"]) {
  const color = SPAWN_POINT_TYPE_ICON_COLOR_VAR[type];
  const opacity = SPAWN_POINT_TYPE_ICON_OPACITY[type];
  const html = `<div style="position:relative;width:25px;height:33px">
    <svg width="25" height="33" viewBox="0 0 24 32" style="filter:drop-shadow(0 1px 3px rgba(0,0,0,0.7))">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill="${color}" fill-opacity="${0.18 * opacity}" stroke="${color}" stroke-opacity="${opacity}" stroke-width="1.6"/>
      <circle cx="12" cy="12" r="8.5" fill="var(--color-bg)" fill-opacity="0.75"/>
    </svg>
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="position:absolute;top:4px;left:6px">${SPAWN_POINT_TYPE_ICON_SVG[type]}</svg>
  </div>`;
  return L.divIcon({
    html,
    className: "",
    iconSize: [25, 33],
    iconAnchor: [12.5, 33],
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

  const mode = useMapUiStore((state) => state.mode);
  const token = useAdminAuthStore((state) => state.token);
  const isDraggable = mode === "admin-edit" && Boolean(token);
  const updateMutation = useUpdateSpawnPoint(token);

  function handleDragEnd(event: L.DragEndEvent) {
    const newLatLng = (event.target as L.Marker).getLatLng();
    const point = latLngToPixel(
      { lat: newLatLng.lat, lng: newLatLng.lng },
      imageSizePx,
    );
    updateMutation.mutate({
      id: spawnPoint.id,
      patch: {
        x: Math.round(point.x * 10) / 10,
        y: Math.round(point.y * 10) / 10,
      },
    });
  }

  return (
    <Marker
      position={[latlng.lat, latlng.lng]}
      icon={icon}
      draggable={isDraggable}
      eventHandlers={isDraggable ? { dragend: handleDragEnd } : undefined}
    >
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
