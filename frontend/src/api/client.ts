/**
 * 백엔드 NestJS API용 공용 Axios 인스턴스. baseURL은 .env의 VITE_API_BASE_URL.
 */
import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",
});
