/**
 * 전적검색 — 캐시 우선(TTL 10분) → 미스 시 공식 PUBG API 프록시. 닉네임 오탈자/레이트리밋은
 * 재시도해도 의미 없어 retry를 끈다.
 */
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";
import { PlayerStatsResponseSchema, type PlayerShard } from "../lib/schemas";

export interface PlayerStatsSearchParams {
  shard: PlayerShard;
  name: string;
}

export function usePlayerStatsSearch(params: PlayerStatsSearchParams | null) {
  return useQuery({
    queryKey: ["player-stats", params?.shard, params?.name],
    queryFn: async () => {
      const { data } = await apiClient.get("/player-stats/search", {
        params: { shard: params!.shard, name: params!.name },
      });
      return PlayerStatsResponseSchema.parse(data);
    },
    enabled: Boolean(params?.shard && params?.name),
    retry: false,
  });
}
