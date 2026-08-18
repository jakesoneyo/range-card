/**
 * MapViewerPage UI 상태 — 레이어 토글, 상호작용 모드(보기/박격포 계산/관리자 편집),
 * 박격포 계산기의 두 클릭 지점. 세션 내 UI 상태라 persist 하지 않는다.
 */
import { create } from "zustand";
import type { PixelPoint } from "../lib/geo";

export type MapInteractionMode = "view" | "mortar" | "admin-edit";

/** 비밀의 방/지하벙커는 기획상 하나의 레이어 토글로 묶인다. */
export interface LayerToggles {
  vehicleFixed: boolean;
  boatFixed: boolean;
  secretBunker: boolean;
  /** 100% 고정 스폰이 아닌 "확률 높은 차고 건물" — vehicleFixed와 성격이 달라 별도 토글. */
  garageHouse: boolean;
  /** 모터글라이더 100% 고정 스폰(에란겔/미라마/론도). */
  glider: boolean;
  /** 차량·글라이더 연료 충전소 — 론도 전용. */
  gasStation: boolean;
}

interface MapUiState {
  layers: LayerToggles;
  /** 인게임 8x8 콜아웃 그리드(A1~H8) 오버레이 표시 여부 — 스폰 포인트 레이어와 달리
   *  API 조회 필터가 아니라 순수 프론트 렌더링 토글이라 layers와 분리해뒀다. */
  showGrid: boolean;
  mode: MapInteractionMode;
  mortarPointA: PixelPoint | null;
  mortarPointB: PixelPoint | null;
  /** admin-edit 모드에서 지도 클릭 시 좌표입력 폼에 채울 대기 좌표. */
  pendingAdminPoint: PixelPoint | null;
  toggleLayer: (key: keyof LayerToggles) => void;
  toggleGrid: () => void;
  setMode: (mode: MapInteractionMode) => void;
  /** 계산 모드 클릭 처리 — A가 비어있으면 A로, 아니면 B로, 둘 다 차있으면 새로 A부터 시작. */
  registerMortarClick: (point: PixelPoint) => void;
  resetMortarPoints: () => void;
  setPendingAdminPoint: (point: PixelPoint) => void;
  clearPendingAdminPoint: () => void;
}

export const useMapUiStore = create<MapUiState>((set) => ({
  layers: {
    vehicleFixed: true,
    boatFixed: true,
    secretBunker: true,
    garageHouse: true,
    glider: true,
    gasStation: true,
  },
  showGrid: false,
  mode: "view",
  mortarPointA: null,
  mortarPointB: null,
  pendingAdminPoint: null,
  toggleLayer: (key) =>
    set((state) => ({
      layers: { ...state.layers, [key]: !state.layers[key] },
    })),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  setMode: (mode) =>
    set({
      mode,
      mortarPointA: null,
      mortarPointB: null,
      pendingAdminPoint: null,
    }),
  registerMortarClick: (point) =>
    set((state) => {
      if (!state.mortarPointA) return { mortarPointA: point };
      if (!state.mortarPointB) return { mortarPointB: point };
      return { mortarPointA: point, mortarPointB: null };
    }),
  resetMortarPoints: () => set({ mortarPointA: null, mortarPointB: null }),
  setPendingAdminPoint: (point) => set({ pendingAdminPoint: point }),
  clearPendingAdminPoint: () => set({ pendingAdminPoint: null }),
}));
