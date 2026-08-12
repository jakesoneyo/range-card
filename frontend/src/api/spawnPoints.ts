/**
 * 스폰 포인트(고정차량/고정보트/비밀의 방/지하벙커) 조회 및 관리자 CRUD.
 * 공개 조회는 GET /maps/:slug/spawn-points, 관리자 CRUD는 /spawn-points에 JWT Bearer로 접근.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import {
  SpawnPointListSchema,
  SpawnPointSchema,
  type SpawnPoint,
  type SpawnPointType,
} from "../lib/schemas";

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

/** 공개 레이어 조회 — 활성 스폰 포인트만, type 다중 필터는 콤마 구분. */
export function usePublicSpawnPoints(
  slug: string | undefined,
  types: SpawnPointType[],
) {
  return useQuery({
    queryKey: ["spawn-points", "public", slug, types],
    queryFn: async () => {
      const { data } = await apiClient.get(`/maps/${slug}/spawn-points`, {
        params: { type: types.join(",") },
      });
      return SpawnPointListSchema.parse(data);
    },
    enabled: Boolean(slug) && types.length > 0,
  });
}

/** 관리자 조회 — 비활성 포함, 편집 패널용. */
export function useAdminSpawnPoints(
  mapId: string | undefined,
  token: string | null,
) {
  return useQuery({
    queryKey: ["spawn-points", "admin", mapId],
    queryFn: async () => {
      const { data } = await apiClient.get("/spawn-points", {
        params: { mapId, includeInactive: true },
        headers: authHeader(token!),
      });
      return SpawnPointListSchema.parse(data);
    },
    enabled: Boolean(mapId) && Boolean(token),
  });
}

export interface CreateSpawnPointInput {
  mapId: string;
  type: SpawnPointType;
  x: number;
  y: number;
  label: string;
  description?: string;
  sourceUrl?: string;
}

export function useCreateSpawnPoint(token: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateSpawnPointInput): Promise<SpawnPoint> => {
      const { data } = await apiClient.post("/spawn-points", input, {
        headers: authHeader(token!),
      });
      return SpawnPointSchema.parse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spawn-points"] });
    },
  });
}

export interface UpdateSpawnPointInput {
  id: string;
  patch: Partial<
    Pick<
      SpawnPoint,
      "x" | "y" | "label" | "description" | "sourceUrl" | "isActive"
    >
  >;
}

export function useUpdateSpawnPoint(token: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: UpdateSpawnPointInput): Promise<SpawnPoint> => {
      const { data } = await apiClient.patch(`/spawn-points/${id}`, patch, {
        headers: authHeader(token!),
      });
      return SpawnPointSchema.parse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spawn-points"] });
    },
  });
}

export function useDeleteSpawnPoint(token: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/spawn-points/${id}`, {
        headers: authHeader(token!),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spawn-points"] });
    },
  });
}
