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
  GARAGE_HOUSE: "차고집(랜덤젠)",
  GLIDER: "글라이더",
  GAS_STATION: "주유소",
};

export const SPAWN_POINT_TYPE_BADGE_TONE: Record<
  SpawnPointType,
  "vehicle" | "boat" | "secret" | "garage" | "glider" | "gasStation"
> = {
  VEHICLE_FIXED: "vehicle",
  BOAT_FIXED: "boat",
  SECRET_ROOM: "secret",
  BUNKER: "secret",
  GARAGE_HOUSE: "garage",
  GLIDER: "glider",
  GAS_STATION: "gasStation",
};

export const SPAWN_POINT_TYPE_DOT_CLASS: Record<SpawnPointType, string> = {
  VEHICLE_FIXED: "bg-marker-vehicle",
  BOAT_FIXED: "bg-marker-boat",
  SECRET_ROOM: "bg-marker-secret",
  BUNKER: "bg-marker-secret",
  GARAGE_HOUSE: "bg-marker-garage",
  GLIDER: "bg-marker-glider",
  GAS_STATION: "bg-marker-gas-station",
};

/** GARAGE_HOUSE만 점선 테두리 — "100% 고정 아님, 확률이 높을 뿐"이라는 걸 마커 형태로도 구분. */
export const SPAWN_POINT_TYPE_BORDER_CLASS: Record<SpawnPointType, string> = {
  VEHICLE_FIXED: "border-solid",
  BOAT_FIXED: "border-solid",
  SECRET_ROOM: "border-solid",
  BUNKER: "border-solid",
  GARAGE_HOUSE: "border-dashed",
  GLIDER: "border-solid",
  GAS_STATION: "border-solid",
};

/**
 * 지도 마커 다이아몬드 안에 그릴 아이콘의 SVG 내부 마크업(lucide-react 설치 버전의 path
 * 데이터를 그대로 옮겨온 것 — divIcon은 React 컴포넌트를 못 그려서 문자열이 필요하다).
 * 비밀의 방/지하벙커는 둘 다 "열쇠가 있어야 들어갈 수 있다"는 같은 게임 설정이라 아이콘을
 * 공유한다(KeyRound) — 색상/사이드바 그룹도 이미 통합돼 있어 일관됨.
 */
export const SPAWN_POINT_TYPE_ICON_SVG: Record<SpawnPointType, string> = {
  VEHICLE_FIXED:
    '<path d="m21 8-2 2-1.5-3.7A2 2 0 0 0 15.646 5H8.4a2 2 0 0 0-1.903 1.257L5 10 3 8"/><path d="M7 14h.01"/><path d="M17 14h.01"/><rect width="18" height="8" x="3" y="10" rx="2"/><path d="M5 18v2"/><path d="M19 18v2"/>',
  BOAT_FIXED:
    '<path d="M12 6v16"/><path d="m19 13 2-1a9 9 0 0 1-18 0l2 1"/><path d="M9 11h6"/><circle cx="12" cy="4" r="2"/>',
  SECRET_ROOM:
    '<path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>',
  BUNKER:
    '<path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>',
  // 여전히 차량이라 VEHICLE_FIXED와 같은 CarFront 아이콘을 쓰고, 점선 테두리로만 구분한다
  // (SPAWN_POINT_TYPE_BORDER_CLASS 참고) — 아이콘까지 다르게 하면 오히려 "차량 계열"이라는
  // 공통점이 흐려진다.
  GARAGE_HOUSE:
    '<path d="m21 8-2 2-1.5-3.7A2 2 0 0 0 15.646 5H8.4a2 2 0 0 0-1.903 1.257L5 10 3 8"/><path d="M7 14h.01"/><path d="M17 14h.01"/><rect width="18" height="8" x="3" y="10" rx="2"/><path d="M5 18v2"/><path d="M19 18v2"/>',
  GLIDER:
    '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
  GAS_STATION:
    '<path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 4 0v-6.998a2 2 0 0 0-.59-1.42L18 5"/><path d="M14 21V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v16"/><path d="M2 21h13"/><path d="M3 9h11"/>',
};

/** LayerTogglePanel 체크박스 키 → 실제 조회할 SpawnPointType 목록. 비밀의 방/지하벙커는 하나로 묶임. */
export const LAYER_TYPE_GROUPS: Record<keyof LayerToggles, SpawnPointType[]> = {
  vehicleFixed: ["VEHICLE_FIXED"],
  boatFixed: ["BOAT_FIXED"],
  secretBunker: ["SECRET_ROOM", "BUNKER"],
  garageHouse: ["GARAGE_HOUSE"],
  glider: ["GLIDER"],
  gasStation: ["GAS_STATION"],
};

export const LAYER_LABELS: Record<keyof LayerToggles, string> = {
  vehicleFixed: "고정 차량",
  boatFixed: "고정 보트",
  secretBunker: "비밀의 방 · 지하벙커",
  garageHouse: "차고집(랜덤젠)",
  glider: "글라이더",
  gasStation: "주유소",
};
