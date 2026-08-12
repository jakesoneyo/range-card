/**
 * SpawnPointType별 한글 라벨/배지 톤/마커 점 색상 클래스 — 여러 컴포넌트(마커, 레이어 패널,
 * 관리자 편집 폼)가 공유하는 단일 출처. 색상은 index.css @theme 토큰과 이름을 맞춘다.
 */
import type { SpawnPointType } from "./schemas";
import type { LayerToggles } from "../stores/mapUiStore";

export const SPAWN_POINT_TYPE_LABEL: Record<SpawnPointType, string> = {
  VEHICLE_FIXED: "고정 차량",
  BOAT_FIXED: "고정 보트",
  SECRET_ROOM: "비밀의 방",
  BUNKER: "지하 벙커",
};

export const SPAWN_POINT_TYPE_BADGE_TONE: Record<
  SpawnPointType,
  "vehicle" | "boat" | "secret"
> = {
  VEHICLE_FIXED: "vehicle",
  BOAT_FIXED: "boat",
  SECRET_ROOM: "secret",
  BUNKER: "secret",
};

export const SPAWN_POINT_TYPE_DOT_CLASS: Record<SpawnPointType, string> = {
  VEHICLE_FIXED: "bg-marker-vehicle",
  BOAT_FIXED: "bg-marker-boat",
  SECRET_ROOM: "bg-marker-secret",
  BUNKER: "bg-marker-secret",
};

/** LayerTogglePanel 체크박스 키 → 실제 조회할 SpawnPointType 목록. 비밀의 방/지하벙커는 하나로 묶임. */
export const LAYER_TYPE_GROUPS: Record<keyof LayerToggles, SpawnPointType[]> = {
  vehicleFixed: ["VEHICLE_FIXED"],
  boatFixed: ["BOAT_FIXED"],
  secretBunker: ["SECRET_ROOM", "BUNKER"],
};

export const LAYER_LABELS: Record<keyof LayerToggles, string> = {
  vehicleFixed: "고정 차량",
  boatFixed: "고정 보트",
  secretBunker: "비밀의 방 · 지하벙커",
};
