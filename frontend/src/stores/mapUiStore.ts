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
}

interface MapUiState {
  layers: LayerToggles;
  mode: MapInteractionMode;
  mortarPointA: PixelPoint | null;
  mortarPointB: PixelPoint | null;
  /** admin-edit 모드에서 지도 클릭 시 좌표입력 폼에 채울 대기 좌표. */
  pendingAdminPoint: PixelPoint | null;
  toggleLayer: (key: keyof LayerToggles) => void;
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
  },
  mode: "view",
  mortarPointA: null,
  mortarPointB: null,
  pendingAdminPoint: null,
  toggleLayer: (key) =>
    set((state) => ({
      layers: { ...state.layers, [key]: !state.layers[key] },
    })),
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
