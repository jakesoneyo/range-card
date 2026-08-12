/**
 * pixelToLatLng / latLngToPixel 라운드트립 검증.
 * 계획서 컨벤션(y축 반전, Leaflet 비의존)이 정확히 지켜지는지 확인.
 */
import { describe, expect, it } from "vitest";
import { latLngToPixel, pixelToLatLng } from "../lib/geo";

describe("pixelToLatLng", () => {
  it("좌상단 원점 픽셀(0,0)은 latLng(imageSizePx, 0)이 된다 (y축 반전)", () => {
    const imageSizePx = 8192;
    expect(pixelToLatLng(0, 0, imageSizePx)).toEqual({ lat: 8192, lng: 0 });
  });

  it("좌하단 픽셀(0, imageSizePx)은 latLng(0, 0)이 된다", () => {
    const imageSizePx = 8192;
    expect(pixelToLatLng(0, imageSizePx, imageSizePx)).toEqual({
      lat: 0,
      lng: 0,
    });
  });

  it("임의의 픽셀 좌표를 변환한다", () => {
    const imageSizePx = 1000;
    expect(pixelToLatLng(300, 400, imageSizePx)).toEqual({
      lat: 600,
      lng: 300,
    });
  });
});

describe("latLngToPixel", () => {
  it("pixelToLatLng의 역변환이다 (라운드트립)", () => {
    const imageSizePx = 8192;
    const cases: Array<[number, number]> = [
      [0, 0],
      [8192, 8192],
      [4096, 4096],
      [123.5, 6789.25],
    ];
    for (const [x, y] of cases) {
      const latlng = pixelToLatLng(x, y, imageSizePx);
      const pixel = latLngToPixel(latlng, imageSizePx);
      expect(pixel.x).toBeCloseTo(x);
      expect(pixel.y).toBeCloseTo(y);
    }
  });

  it("latlng(0,0)은 픽셀(0, imageSizePx)이 된다", () => {
    const imageSizePx = 1000;
    expect(latLngToPixel({ lat: 0, lng: 0 }, imageSizePx)).toEqual({
      x: 0,
      y: 1000,
    });
  });
});
