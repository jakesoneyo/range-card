/**
 * 픽셀 좌표 ↔ Leaflet latlng 변환. Leaflet 비의존 순수함수 — 라운드트립 단위테스트 가능,
 * MapCanvas 등 Leaflet 사용처에서 L.latLng(...)로 감싸 쓴다.
 *
 * 컨벤션(고정): DB엔 이미지 좌상단 원점 픽셀 (x, y) [0, imageSizePx] 저장.
 * Leaflet L.CRS.Simple은 좌하단 원점 + y축이 위로 증가하는 좌표계라 y를 반전한다.
 */

export interface PixelPoint {
  x: number;
  y: number;
}

export interface LatLngPoint {
  lat: number;
  lng: number;
}

/** 픽셀 좌표(좌상단 원점) → Leaflet latlng(좌하단 원점, y축 반전). 마커 렌더링용. */
export function pixelToLatLng(
  x: number,
  y: number,
  imageSizePx: number,
): LatLngPoint {
  return { lat: imageSizePx - y, lng: x };
}

/** Leaflet latlng → 픽셀 좌표(좌상단 원점). 지도 클릭 → 좌표입력(계산기·관리자 편집) 공용 역변환. */
export function latLngToPixel(
  latlng: LatLngPoint,
  imageSizePx: number,
): PixelPoint {
  return { x: latlng.lng, y: imageSizePx - latlng.lat };
}
