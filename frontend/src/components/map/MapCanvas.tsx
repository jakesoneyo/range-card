/**
 * react-leaflet + L.CRS.Simple 기반 맵 뷰어. 맵 이미지가 아직 없는 동안은 단색 placeholder를
 * 보여주고, map.imageUrl이 실제로 로드되면 자동으로 ImageOverlay로 전환된다(코드 변경 불필요).
 *
 * 확대 화질: 기본(축소) 화면은 지금까지 쓰던 2048px 이미지(ImageOverlay)를 그대로 쓰고,
 * 줌 0 이상(=CRS.Simple 스케일상 2048px 초과 배율)부터는 8192px 원본을 256px 타일로 쪼갠
 * TileLayer로 바꿔치기한다. 전체를 다시 그리지 않고 화면에 보이는 타일만 받아오므로
 * 축소 상태의 로딩량은 그대로, 확대했을 때만 필요한 만큼만 고화질을 받아온다.
 * 타일은 `tools/make-map-tiles.py`로 미리 잘라 `public/maps/tiles/<slug>/`에 커밋해둔 것 —
 * 아직 안 만든 맵은 TILED_MAPS에 없으면 기존처럼 2048px 하나로만 전체 줌 범위를 커버한다.
 */
import { useMemo } from "react";
import {
  ImageOverlay,
  MapContainer,
  Rectangle,
  TileLayer,
  useMapEvent,
} from "react-leaflet";
import L, { CRS } from "leaflet";
import { latLngToPixel, type PixelPoint } from "../../lib/geo";
import type { MapEntity, SpawnPoint } from "../../lib/schemas";
import { useImageLoadState } from "../../lib/useImageLoadState";
import { SpawnPointMarker } from "./SpawnPointMarker";

/** 8192px 타일 세트가 준비된 맵 slug. */
const TILED_MAPS = new Set(["erangel", "miramar", "rondo", "taego"]);
/** 타일이 8192px 원본 기준이라, 2048px 기준 좌표계(zoom 0)에서 2^2배(=8192/2048) 지점이 네이티브 해상도. */
const TILE_NATIVE_ZOOM = 2;

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
          <>
            {/* ImageOverlay는 기본적으로 overlayPane(z≈400)에 그려져 tilePane(z≈200)보다
                항상 위에 뜬다 — TileLayer를 따로 추가해도 그 밑에 깔려 안 보이는 문제가
                생기므로, 같은 pane(tilePane)을 강제로 지정해 DOM 순서(=마운트 순서)로
                쌓이게 만든다. ImageOverlay는 Leaflet의 일반 Layer라 minZoom/maxZoom으로
                줌별 표시를 못 가른다(GridLayer 전용 옵션) — 그냥 항상 깔아두고, 아래
                TileLayer가 zoom>=0부터 그 위를 완전히 덮어써서 화질을 대체한다. */}
            <ImageOverlay url={map.imageUrl} bounds={bounds} pane="tilePane" />
            {TILED_MAPS.has(map.slug) && (
              <TileLayer
                url={`/maps/tiles/${map.slug}/{x}_{y}.webp`}
                tileSize={256}
                bounds={bounds}
                noWrap
                minZoom={0}
                maxZoom={3}
                minNativeZoom={TILE_NATIVE_ZOOM}
                maxNativeZoom={TILE_NATIVE_ZOOM}
              />
            )}
          </>
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
