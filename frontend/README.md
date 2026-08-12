# RANGE CARD — Frontend

PUBG 택티컬 인텔 프론트엔드. 맵 인텔 오버레이(고정 스폰/비밀의 방/박격포 계산기)와
공식 PUBG API 기반 전적검색을 제공한다. 비영리 팬 프로젝트이며 KRAFTON과 무관하다.

## 스택

Vite + React 19 + TypeScript, Tailwind v4(CSS-first `@theme`), Zustand, TanStack Query,
Axios, Zod, react-leaflet(`L.CRS.Simple`), lucide-react. 테스트는 Vitest.

## 실행

```bash
npm install
cp .env.example .env   # VITE_API_BASE_URL 확인
npm run dev
```

- `npm run build` — 타입체크(`tsc -b`) + 프로덕션 빌드
- `npm run test` — Vitest (`lib/geo.ts`, `lib/mortar.ts` 순수함수 테스트)
- `npm run lint` — oxlint

## 디자인 시스템

Variant E(PUBG Game UI 톤) 확정안. `src/index.css`의 `@theme` 블록에 컬러/폰트 토큰을
등록하고 모든 컴포넌트가 `bg-panel`/`text-ink`/`border-accent` 같은 유틸리티 클래스로만
참조한다(색상 하드코딩 금지). 대각선 컷 코너는 `.clip-corner`/`.clip-corner-sm`, 워드마크
스큐는 `.font-wordmark`, 숫자는 `.font-tabular`로 통일. 다크 전용(라이트 모드 없음).

## 픽셀 ↔ 위경도 변환 컨벤션

DB엔 이미지 좌상단 원점 픽셀 좌표를 저장한다. `src/lib/geo.ts`의 `pixelToLatLng`/
`latLngToPixel`이 Leaflet 비의존 순수함수로 y축 반전을 처리하며, 라운드트립 테스트로
검증돼 있다(`src/test/geo.test.ts`).

## 맵 이미지 placeholder

4개 맵의 실제 캡처 이미지는 아직 준비되지 않았다. `MapCanvas`는 `map.imageUrl`을
브라우저에서 프리로드해보고 성공하면 자동으로 `ImageOverlay`로 전환하며, 실패하면
"지도 이미지 준비중" placeholder를 보여준다 — 백엔드가 실제 이미지 URL을 서빙하기
시작하면 프론트 코드 변경 없이 그대로 반영된다.

## 백엔드 API 계약에 대한 가정 (미검증)

이 프론트엔드는 백엔드와 병렬로 개발되어, 계획서(PLAN)에 문서화된 엔드포인트/응답
형태를 신뢰하고 구현했다. 대부분(맵/스폰포인트/인증)은 계획서에 정확히 명시돼 있어
그대로 따랐지만, `GET /player-stats/search` 응답 바디의 **필드 이름은 계획서에
명시되지 않아 추정**했다 — `src/lib/schemas.ts`의 `PlayerStatsResponseSchema` 주석에
가정임을 명시해뒀다. 백엔드가 완성되면 실제 응답과 대조해 스키마를 재검증해야 한다.

## 데모/관리자 로그인

일반 사용자는 로그인 없이 맵 선택·전적검색을 바로 사용한다. 맵 데이터 유지보수용
관리자 인증만 `MapViewerPage` 구석 자물쇠 아이콘 → 모달로 진입할 수 있다. 모달의
"회원가입 없이 둘러보기" 버튼은 `admin`/`admin` 값을 채워 동일한 로그인 절차
(`POST /auth/login`)를 호출할 뿐, 인증을 우회하지 않는다.
