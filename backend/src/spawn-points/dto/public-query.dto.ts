import { z } from 'zod';
import { SpawnPointType } from '@prisma/client';

// 공개 GET /maps/:slug/spawn-points?type=VEHICLE_FIXED,BOAT_FIXED — 콤마로 여러 타입 동시 필터.
// 쿼리스트링은 항상 string(또는 undefined)으로 들어오므로 여기서 배열로 변환한다.
export const PublicSpawnPointQuerySchema = z.object({
  type: z
    .string()
    .optional()
    .transform((value) => value?.split(',').map((t) => t.trim()))
    .pipe(z.array(z.nativeEnum(SpawnPointType)).optional()),
});

export type PublicSpawnPointQueryDto = z.infer<
  typeof PublicSpawnPointQuerySchema
>;
