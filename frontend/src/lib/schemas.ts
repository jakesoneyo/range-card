/**
 * API 응답 런타임 검증 스키마 (Zod). PLAN.md 데이터 모델/API 계약을 프론트 타입의
 * 단일 출처로 삼는다 — 백엔드가 계약을 어기면 파싱 단계에서 바로 드러난다.
 *
 * player-stats 관련 스키마는 백엔드가 공식 PUBG JSON:API 원본을 프론트 친화적으로
 * "정규화"해서 내려준다고 가정한 것이다 — 백엔드 완성 후 실제 응답과 대조 재검증 필요.
 */
import { z } from "zod";

export const SpawnPointTypeSchema = z.enum([
  "VEHICLE_FIXED",
  "BOAT_FIXED",
  "SECRET_ROOM",
  "BUNKER",
  // 100% 고정 스폰은 아니고 "확률이 높은 차고 건물" — VEHICLE_FIXED와 성격이 달라 분리.
  "GARAGE_HOUSE",
]);
export type SpawnPointType = z.infer<typeof SpawnPointTypeSchema>;

export const MapSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  sizeM: z.number(),
  imageUrl: z.string(),
  imageSizePx: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type MapEntity = z.infer<typeof MapSchema>;

export const MapListSchema = z.array(MapSchema);

export const SpawnPointSchema = z.object({
  id: z.string(),
  mapId: z.string(),
  type: SpawnPointTypeSchema,
  x: z.number(),
  y: z.number(),
  label: z.string(),
  description: z.string().nullable(),
  sourceUrl: z.string().nullable(),
  isActive: z.boolean(),
  lastVerifiedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type SpawnPoint = z.infer<typeof SpawnPointSchema>;

export const SpawnPointListSchema = z.array(SpawnPointSchema);

export const AuthLoginResponseSchema = z.object({
  accessToken: z.string(),
});
export type AuthLoginResponse = z.infer<typeof AuthLoginResponseSchema>;

/** 공식 API의 게임모드별(솔로/듀오/스쿼드 × TPP/FPP) 시즌 통계 한 세트. */
export const PlayerModeStatsSchema = z.object({
  mode: z.string(),
  roundsPlayed: z.number(),
  wins: z.number(),
  top10s: z.number(),
  kills: z.number(),
  assists: z.number(),
  headshotKills: z.number(),
  longestKillM: z.number(),
});
export type PlayerModeStats = z.infer<typeof PlayerModeStatsSchema>;

export const PlayerStatsResponseSchema = z.object({
  playerName: z.string(),
  shard: z.string(),
  seasonId: z.string(),
  cachedAt: z.string(),
  // 429로 캐시 폴백된 응답인 경우 true — UI에서 "최신 데이터 아닐 수 있음" 안내용.
  stale: z.boolean().optional(),
  modes: z.array(PlayerModeStatsSchema),
});
export type PlayerStatsResponse = z.infer<typeof PlayerStatsResponseSchema>;

export const PLAYER_SHARDS = ["steam", "kakao", "psn", "xbox"] as const;
export type PlayerShard = (typeof PLAYER_SHARDS)[number];
