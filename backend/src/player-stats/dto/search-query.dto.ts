import { z } from 'zod';

// GET /player-stats/search?shard=steam&name=닉네임
// shard는 공식 API가 지원하는 플랫폼 값으로 한정 — 프론트 lib/schemas.ts의 PLAYER_SHARDS와 동일하게 유지.
export const SearchPlayerStatsQuerySchema = z.object({
  shard: z.enum(['steam', 'kakao', 'psn', 'xbox']),
  name: z.string().min(1),
});

export type SearchPlayerStatsQueryDto = z.infer<
  typeof SearchPlayerStatsQuerySchema
>;
