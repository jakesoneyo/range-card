import { CreateSpawnPointSchema } from './create-spawn-point.dto';

// PATCH는 부분 수정 — 패치 대응(관리자가 좌표 하나만 옮기는 등)을 위해 전 필드 optional.
export const UpdateSpawnPointSchema = CreateSpawnPointSchema.partial();

export type UpdateSpawnPointDto = ReturnType<
  typeof UpdateSpawnPointSchema.parse
>;
