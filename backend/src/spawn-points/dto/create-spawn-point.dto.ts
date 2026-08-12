import { z } from 'zod';
import { SpawnPointType } from '@prisma/client';

// 관리자 좌표 등록 스키마. x/y는 원본 이미지 픽셀 좌표(좌상단 기준) — 프론트 lib/geo.ts가
// Leaflet latlng으로 변환하는 컨벤션을 그대로 따른다(ARCHITECTURE.md 참고).
export const CreateSpawnPointSchema = z.object({
  mapId: z.string().min(1),
  type: z.nativeEnum(SpawnPointType),
  x: z.number(),
  y: z.number(),
  label: z.string().min(1),
  description: z.string().optional(),
  sourceUrl: z.string().optional(),
  isActive: z.boolean().optional(),
  lastVerifiedAt: z.coerce.date().optional(),
});

export type CreateSpawnPointDto = z.infer<typeof CreateSpawnPointSchema>;
