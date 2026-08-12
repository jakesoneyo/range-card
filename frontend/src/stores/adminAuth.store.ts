/**
 * 관리자 JWT 토큰 — 의도적으로 localStorage에 저장하지 않는다(메모리만).
 * 새로고침하면 로그아웃되는 게 정상 동작: 관리자 세션을 브라우저에 오래 남기지 않기 위한 선택.
 */
import { create } from "zustand";

interface AdminAuthState {
  token: string | null;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  token: null,
  setToken: (token) => set({ token }),
  logout: () => set({ token: null }),
}));
