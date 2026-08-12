/**
 * 맵 목록/상세 조회 — 공개 GET, 인증 불필요.
 */
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";
import { MapListSchema, MapSchema } from "../lib/schemas";

export function useMaps() {
  return useQuery({
    queryKey: ["maps"],
    queryFn: async () => {
      const { data } = await apiClient.get("/maps");
      return MapListSchema.parse(data);
    },
  });
}

export function useMap(slug: string | undefined) {
  return useQuery({
    queryKey: ["maps", slug],
    queryFn: async () => {
      const { data } = await apiClient.get(`/maps/${slug}`);
      return MapSchema.parse(data);
    },
    enabled: Boolean(slug),
  });
}
