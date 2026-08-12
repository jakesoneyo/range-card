/**
 * 박격포 사거리 판정 경계값(121m / 700m) 검증. 평면거리(피타고라스)만 사용.
 */
import { describe, expect, it } from "vitest";
import {
  MORTAR_MAX_RANGE_M,
  MORTAR_MIN_RANGE_M,
  calculateMortarRange,
} from "../lib/mortar";

describe("calculateMortarRange", () => {
  it("최소 사거리(121m) 정확히는 사거리 이내로 판정한다", () => {
    const result = calculateMortarRange(
      { x: 0, y: 0 },
      { x: MORTAR_MIN_RANGE_M, y: 0 },
      1,
    );
    expect(result.distanceM).toBeCloseTo(121);
    expect(result.status).toBe("in-range");
    expect(result.warning).toBeNull();
  });

  it("최소 사거리보다 1m 짧으면 too-close로 경고를 반환한다", () => {
    const result = calculateMortarRange(
      { x: 0, y: 0 },
      { x: MORTAR_MIN_RANGE_M - 1, y: 0 },
      1,
    );
    expect(result.status).toBe("too-close");
    expect(result.warning).not.toBeNull();
  });

  it("최대 사거리(700m) 정확히는 사거리 이내로 판정한다", () => {
    const result = calculateMortarRange(
      { x: 0, y: 0 },
      { x: MORTAR_MAX_RANGE_M, y: 0 },
      1,
    );
    expect(result.distanceM).toBeCloseTo(700);
    expect(result.status).toBe("in-range");
    expect(result.warning).toBeNull();
  });

  it("최대 사거리보다 1m 길면 too-far로 경고를 반환한다", () => {
    const result = calculateMortarRange(
      { x: 0, y: 0 },
      { x: MORTAR_MAX_RANGE_M + 1, y: 0 },
      1,
    );
    expect(result.status).toBe("too-far");
    expect(result.warning).not.toBeNull();
  });

  it("두 지점이 같으면 거리 0, too-close로 판정한다", () => {
    const result = calculateMortarRange({ x: 5, y: 5 }, { x: 5, y: 5 }, 1);
    expect(result.distanceM).toBe(0);
    expect(result.status).toBe("too-close");
  });

  it("픽셀 거리에 metersPerPixel 스케일을 곱해 실제 거리를 구한다", () => {
    // 3-4-5 삼각형: 픽셀거리 5, metersPerPixel=2 → 실거리 10m
    const result = calculateMortarRange({ x: 0, y: 0 }, { x: 3, y: 4 }, 2);
    expect(result.distanceM).toBeCloseTo(10);
    expect(result.status).toBe("too-close");
  });

  it("사거리 중간값은 경고 없이 in-range다", () => {
    const result = calculateMortarRange({ x: 0, y: 0 }, { x: 400, y: 0 }, 1);
    expect(result.status).toBe("in-range");
    expect(result.warning).toBeNull();
  });
});
