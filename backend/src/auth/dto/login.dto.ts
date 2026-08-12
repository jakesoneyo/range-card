import { z } from 'zod';

// 관리자 로그인 요청 스키마. 이 프로젝트엔 이메일 기반 회원가입이 없어(관리자만 존재)
// `username` 필드를 쓴다 — CLAUDE.md 이메일 예외 규칙과 무관하게 애초에 이메일 형식 검증
// 자체가 필요 없는 케이스.
export const LoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export type LoginDto = z.infer<typeof LoginSchema>;
