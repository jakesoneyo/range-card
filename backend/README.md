# RANGE CARD — Backend

PUBG 택티컬 인텔 백엔드. 공개 읽기전용 맵/스폰포인트 API, 관리자 인증(JWT) + 좌표 CRUD,
공식 `api.pubg.com` 연동 전적검색을 제공하는 NestJS 서버.

## 스택

NestJS + TypeScript, Prisma(Postgres/Neon), Passport-JWT + bcrypt, `@nestjs/throttler`,
`@nestjs/swagger`, Zod(요청 검증), Jest + supertest + Testcontainers.

## 로컬 실행

```bash
npm install
cp .env.example .env          # DATABASE_URL / JWT_SECRET / PUBG_API_KEY 채우기
npx prisma migrate deploy
npm run seed:admin             # admin/admin 1회성 시드(있으면 스킵)
npm run seed:spawn-points      # 큐레이션 좌표 시드 (--reset 옵션으로 전체 재생성)
npm run start:dev
```

DB가 로컬에 없으면 임시 컨테이너로:

```bash
docker run -d --name range-card-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=rangecard -p 5433:5432 postgres:16-alpine
```

## 환경변수

| 변수             | 필수 | 설명                                                                                                                        |
| ---------------- | :--: | --------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`   |  ✅  | Postgres 연결 문자열 (Neon 등)                                                                                              |
| `JWT_SECRET`     |  ✅  | 관리자 로그인 JWT 서명 키 — 운영 배포 시 반드시 교체                                                                        |
| `JWT_EXPIRES_IN` |      | 기본 `1d`                                                                                                                   |
| `PUBG_API_KEY`   | ✅*  | developer.pubg.com 발급 키 — 전적검색(`/player-stats/search`) 전용, 없어도 나머지 API는 정상 동작                           |
| `PORT`           |      | 기본 `3000`                                                                                                                 |
| `CORS_ORIGIN`    |  ✅  | 프론트 오리진 (로컬 기본 `http://localhost:5173`, Vite가 포트 충돌 시 자동으로 다음 포트를 쓰므로 실제 뜬 포트와 맞춰야 함) |

## API

Swagger 문서: `http://localhost:3000/api/docs`

- 공개: `GET /health`, `GET /maps`, `GET /maps/:slug`, `GET /maps/:slug/spawn-points?type=...`,
  `GET /player-stats/search?shard=&name=`(분당 8회 제한)
- 관리자(JWT Bearer, `POST /auth/login`으로 발급): `GET /spawn-points`, `POST /spawn-points`,
  `PATCH /spawn-points/:id`, `DELETE /spawn-points/:id`

## 테스트

```bash
npm test          # 단위 테스트 (Jest, mock만 사용 — 네트워크/DB 불필요)
npm run test:e2e  # Testcontainers로 Postgres 띄워 실제 DB against e2e (Docker 필요)
```

## 데이터 시드 워크플로

`data/<slug>.spawn-points.json`이 좌표 데이터의 단일 소스다. `scripts/seed-spawn-points.ts`가
이 JSON을 읽어 upsert한다(`(mapId, type, label)` 자연키 기준, `--reset`이면 대상 맵을 통째로
비우고 재생성). 지금 커밋된 JSON은 나무위키·커뮤니티 자료를 교차검증해 큐레이션한 실좌표다
(전수조사 아님, `sourceUrl`로 출처 추적 가능). 이후 유지보수는 관리자로 로그인해 지도 클릭으로
좌표를 직접 추가/수정하거나, 이 JSON을 갈아끼우고 `--reset`으로 재시드하면 된다.

## 왜 `PubgApiError`도 503인가

`player-stats.service.ts`는 PUBG API 실패를 세 갈래로 나눈다: 닉네임이 없으면 404,
레이트리밋(429)이고 폴백할 캐시가 없으면 503, 그 외(키 미설정 등 연동 자체 불가)도 503 —
전부 "클라이언트 요청은 잘못이 없는데 우리 쪽 PUBG 연동이 지금 응답할 수 없다"는 같은
의미라서 500(우리 코드 버그)이 아니라 503으로 통일했다.
