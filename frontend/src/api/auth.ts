/**
 * 관리자 로그인 — 맵 데이터 유지보수용. 일반 사용자는 이 경로를 전혀 보지 않는다
 * (전용 페이지 없음, MapViewerPage 구석 자물쇠 아이콘 → 모달 진입).
 */
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "./client";
import { AuthLoginResponseSchema } from "../lib/schemas";

export interface AdminLoginInput {
  username: string;
  password: string;
}

export function useAdminLogin() {
  return useMutation({
    mutationFn: async (input: AdminLoginInput) => {
      const { data } = await apiClient.post("/auth/login", input);
      return AuthLoginResponseSchema.parse(data);
    },
  });
}
