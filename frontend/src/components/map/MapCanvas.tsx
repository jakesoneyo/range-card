/**
 * react-leaflet + L.CRS.Simple 기반 맵 뷰어. 맵 이미지가 아직 없는 동안은 단색 placeholder를
 * 보여주고, map.imageUrl이 실제로 로드되면 자동으로 ImageOverlay로 전환된다(코드 변경 불필요).
 */
import { useMemo } from "react";
import {
  ImageOverlay,
  MapContainer,
  Rectangle,
  useMapEvent,
} from "react-leaflet";
import L, { CRS } from "leaflet";
import { latLngToPixel, type PixelPoint } from "../../lib/geo";
import type { MapEntity, SpawnPoint } from "../../lib/schemas";
import { useImageLoadState } from "../../lib/useImageLoadState";
import { SpawnPointMarker } from "./SpawnPointMarker";

function ClickHandler({
  imageSizePx,
  onPixelClick,
}: {
  imageSizePx: number;
  onPixelClick: (point: PixelPoint) => void;
}) {
  useMapEvent("click", (event) => {
    onPixelClick(latLngToPixel(event.latlng, imageSizePx));
  });
  return null;
}

export function MapCanvas({
  map,
  spawnPoints,
  onPixelClick,
}: {
  map: MapEntity;
  spawnPoints: SpawnPoint[];
  onPixelClick?: (point: PixelPoint) => void;
}) {
  const imageState = useImageLoadState(map.imageUrl);
  // 정사각형 맵이라 y축 반전 여부와 무관하게 바운딩박스 자체는 [0, imageSizePx]^2로 동일.
  const bounds: L.LatLngBoundsExpression = [
    [0, 0],
    [map.imageSizePx, map.imageSizePx],
  ];
  // Leaflet Rectangle의 pathOptions는 CSS 클래스를 못 받아 색상을 직접 넘겨야 한다.
  // 디자인 토큰(--color-panel-2)을 하드코딩 대신 런타임에 실제 CSS 변수값으로 읽어서 쓴다.
  const placeholderFillColor = useMemo(() => {
    if (typeof document === "undefined") return "#211d19";
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-panel-2")
      .trim();
    return value || "#211d19";
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden border border-border">
      <MapContainer
        crs={CRS.Simple}
        bounds={bounds}
        maxBounds={bounds}
        maxBoundsViscosity={0.8}
        minZoom={-2}
        maxZoom={3}
        // 정수 단위로만 줌 레벨을 스냅하면(기본값) fitBounds가 계산한 "꽉 채우는" 줌이
        // 한 단계 아래로 내림되어 이미지가 뷰포트 가운데 작게 뜨는 문제가 생긴다.
        // 0.25 단위로 더 세밀하게 스냅해서 실제로 꽉 차게 맞춘다.
        zoomSnap={0.25}
        zoomDelta={0.5}
        scrollWheelZoom
        className="h-full w-full bg-panel-2"
        attributionControl={false}
      >
        {imageState === "loaded" ? (
          <ImageOverlay url={map.imageUrl} bounds={bounds} />
        ) : (
          <Rectangle
            bounds={bounds}
            pathOptions={{
              color: "transparent",
              fillColor: placeholderFillColor,
              fillOpacity: 1,
            }}
          />
        )}
        {onPixelClick && (
          <ClickHandler
            imageSizePx={map.imageSizePx}
            onPixelClick={onPixelClick}
          />
        )}
        {spawnPoints.map((spawnPoint) => (
          <SpawnPointMarker
            key={spawnPoint.id}
            spawnPoint={spawnPoint}
            imageSizePx={map.imageSizePx}
          />
        ))}
      </MapContainer>

      {imageState !== "loaded" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="font-wordmark clip-corner-sm border border-border bg-panel/90 px-4 py-2 text-sm text-sub">
            지도 이미지 준비중 — 좌표 배치만 미리 확인할 수 있습니다
          </p>
        </div>
      )}
    </div>
  );
}
