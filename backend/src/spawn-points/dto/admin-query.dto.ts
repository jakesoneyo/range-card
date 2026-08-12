import { z } from 'zod';
import { SpawnPointType } from '@prisma/client';

// 관리자 GET /spawn-points?mapId=&type=&includeInactive=true — 편집 화면의 전체 목록 조회.
// includeInactive가 없으면(또는 'false') isActive=true인 것만 보여준다.
export const AdminSpawnPointQuerySchema = z.object({
  mapId: z.string().optional(),
  type: z.nativeEnum(SpawnPointType).optional(),
  includeInactive: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
});

export type AdminSpawnPointQueryDto = z.infer<
  typeof AdminSpawnPointQuerySchema
>;
