import { z } from 'zod';

// GET /player-stats/search?shard=steam&name=닉네임
export const SearchPlayerStatsQuerySchema = z.object({
  shard: z.string().min(1),
  name: z.string().min(1),
});

export type SearchPlayerStatsQueryDto = z.infer<
  typeof SearchPlayerStatsQuerySchema
>;
