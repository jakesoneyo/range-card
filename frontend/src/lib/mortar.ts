/**
 * 박격포(모타) 사거리 계산 — 순수 프론트엔드 로직. 서버 왕복 불필요.
 * 두 지점의 평면거리(피타고라스, 고도 무시)만 계산해 121~700m 사거리 이내인지 판정한다.
 * 121/700m는 커뮤니티 추정치(공식 수치 비공개) — README에 출처 고지.
 */
import type { PixelPoint } from "./geo";

export const MORTAR_MIN_RANGE_M = 121;
export const MORTAR_MAX_RANGE_M = 700;

export type MortarRangeStatus = "too-close" | "in-range" | "too-far";

export interface MortarCalculationResult {
  distanceM: number;
  status: MortarRangeStatus;
  warning: string | null;
}

/**
 * 두 픽셀 좌표 사이의 실거리(m)를 구해 박격포 사거리 판정을 반환한다.
 * @param from 발사 지점 픽셀 좌표
 * @param to 목표 지점 픽셀 좌표
 * @param metersPerPixel 맵의 sizeM / imageSizePx (픽셀→미터 스케일)
 */
export function calculateMortarRange(
  from: PixelPoint,
  to: PixelPoint,
  metersPerPixel: number,
): MortarCalculationResult {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distanceM = Math.sqrt(dx * dx + dy * dy) * metersPerPixel;

  if (distanceM < MORTAR_MIN_RANGE_M) {
    return {
      distanceM,
      status: "too-close",
      warning: `사거리 미달 (최소 ${MORTAR_MIN_RANGE_M}m, 현재 ${distanceM.toFixed(0)}m) — 착탄하지 않습니다.`,
    };
  }
  if (distanceM > MORTAR_MAX_RANGE_M) {
    return {
      distanceM,
      status: "too-far",
      warning: `사거리 초과 (최대 ${MORTAR_MAX_RANGE_M}m, 현재 ${distanceM.toFixed(0)}m) — 도달하지 않습니다.`,
    };
  }
  return { distanceM, status: "in-range", warning: null };
}
