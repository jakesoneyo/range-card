/**
 * react-leaflet + L.CRS.Simple 기반 맵 뷰어. 맵 이미지가 아직 없는 동안은 단색 placeholder를
 * 보여주고, map.imageUrl이 실제로 로드되면 자동으로 ImageOverlay로 전환된다(코드 변경 불필요).
 */
import { useEffect, useState } from "react";
import {
  ImageOverlay,
  MapContainer,
  Rectangle,
  useMapEvent,
} from "react-leaflet";
import L, { CRS } from "leaflet";
import { latLngToPixel, type PixelPoint } from "../../lib/geo";
import type { MapEntity, SpawnPoint } from "../../lib/schemas";
import { SpawnPointMarker } from "./SpawnPointMarker";

type ImageLoadState = "loading" | "loaded" | "error";

/** map.imageUrl이 실제로 존재하는지 브라우저에서 프리로드로 확인 — 아직 준비 안 된 맵은 자동 placeholder. */
function useImageLoadState(url: string | undefined): ImageLoadState {
  const [state, setState] = useState<ImageLoadState>("loading");

  useEffect(() => {
    if (!url) {
      setState("error");
      return;
    }
    setState("loading");
    const img = new Image();
    img.onload = () => setState("loaded");
    img.onerror = () => setState("error");
    img.src = url;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [url]);

  return state;
}

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

  return (
    <div className="relative h-full w-full overflow-hidden border border-border">
      <MapContainer
        crs={CRS.Simple}
        bounds={bounds}
        maxBounds={bounds}
        maxBoundsViscosity={0.8}
        minZoom={-2}
        maxZoom={3}
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
              fillColor: "#211d19",
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
