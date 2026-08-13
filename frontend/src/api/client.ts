/**
 * 백엔드 NestJS API용 공용 Axios 인스턴스. baseURL은 .env의 VITE_API_BASE_URL.
 */
import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",
});

/**
 * axios 에러에서 사용자에게 보여줄 메시지를 뽑아낸다. 백엔드 AllExceptionsFilter가
 * `{ statusCode, error, message }` 형태로 내려주므로 그 message를 우선하고,
 * 없으면(네트워크 단절 등) axios의 원문 메시지로 폴백한다.
 */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string") return message;
  }
  if (error instanceof Error) return error.message;
  return "알 수 없는 오류가 발생했습니다.";
}
