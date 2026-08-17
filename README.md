# NOOBG

PUBG(배틀그라운드) **택티컬 맵 인텔 + 전적검색** 툴. "Range Card"는 사격진지에서 목표물까지
거리·방위를 미리 기록해두는 군사 용어 — 이 프로젝트가 하는 일(고정 스폰·비밀의 방 위치와
박격포 사거리를 지도 위에서 참조하는 것) 그대로다.

**비공식 팬 프로젝트이며 KRAFTON/PUBG Corp와 무관하다.**

- 맵을 고르면 지도가 뜨고, 우측 체크박스로 **고정 차량·고정 보트·비밀의 방·지하벙커·
  차고집(랜덤젠)·글라이더·주유소** 레이어를 켜고 끌 수 있다. 차고집은 100% 고정 스폰은
  아니고 확률이 높은 랜덤스폰 건물이라, 지도 마커도 점선 테두리로 구분된다. 글라이더·
  주유소는 맵마다 배치가 달라(글라이더는 에란겔·미라마·론도, 주유소는 론도 전용) 없는
  맵에서는 해당 체크박스가 자동으로 빈 상태로 표시된다.
- 지도 위 두 지점을 클릭하면 **박격포 사거리 계산기**가 평면거리를 미터로 환산해 유효
  사거리(121~700m) 안인지 판정한다.
- **전적검색**은 공식 `api.pubg.com` 연동 — 닉네임으로 시즌 통계를 조회하고, 로그인 없이
  브라우저에만 저장되는 즐겨찾기로 재검색을 빠르게 한다.

자세한 설계 배경은 [`ARCHITECTURE.md`](./ARCHITECTURE.md), 데이터 출처별 신뢰도/법적 판단은
[`DATA-SOURCES.md`](./DATA-SOURCES.md) 참고.

## 데모 계정

일반 이용(맵 열람·전적검색)엔 로그인 자체가 필요 없다. 좌표 데이터를 유지보수하는
**관리자**만 인증이 필요하고, 전용 페이지 없이 맵 화면 구석의 자물쇠 아이콘으로 진입한다.

- 자물쇠 아이콘 클릭 → 로그인 모달의 **"회원가입 없이 둘러보기"** 버튼 한 번이면
  `admin`/`admin` 계정으로 로그인된다. 버튼 아래 안내문: _"회원가입 없이 체험해 볼 수
  있습니다."_
- 데모 버튼도 일반 로그인과 동일하게 `POST /auth/login`을 호출하고 비밀번호는 항상 정상
  bcrypt 비교를 거친다 — 인증을 우회하는 별도 엔드포인트는 없다.
- 로그인 후 지도 클릭이 좌표 입력 폼으로 바뀌는 편집모드에 진입해, 좌표를 추가·수정·
  삭제(비활성화 포함)할 수 있다.

## 핵심 기능

| 기능                 | 설명                                                                           |
| -------------------- | ------------------------------------------------------------------------------ |
| 맵 인텔 오버레이     | 에란겔·미라마·론도·태이고 4개 맵, 레이어 7종 체크박스 토글                     |
| 박격포 사거리 계산기 | 지도 두 지점 클릭 → 평면거리(m) → 유효사거리(121~700m) 판정, 순수함수로 검증됨 |
| 전적검색             | 공식 PUBG API, 캐시(TTL 10분)+레이트리밋 방어로 10req/분 예산 보호             |
| 로컬 즐겨찾기        | 로그인 없이 브라우저 localStorage에 닉네임 저장                                |
| 관리자 좌표 CRUD     | JWT 인증, 지도 클릭으로 좌표 추가/수정 — 패치로 위치가 바뀌어도 대응 가능      |

## 로컬 실행

```bash
# 백엔드
cd backend
npm install
cp .env.example .env   # DATABASE_URL / JWT_SECRET / PUBG_API_KEY
npx prisma migrate deploy
npm run seed:admin
npm run seed:spawn-points
npm run start:dev

# 프론트 (다른 터미널)
cd frontend
npm install
cp .env.example .env   # VITE_API_BASE_URL이 백엔드 포트와 일치하는지 확인
npm run dev
```

DB가 없으면 임시 컨테이너로: `docker run -d -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=rangecard -p 5433:5432 postgres:16-alpine`.
자세한 환경변수/스크립트는 [`backend/README.md`](./backend/README.md) · [`frontend/README.md`](./frontend/README.md).

## API 문서 / 테스트

- Swagger: `http://localhost:3000/api/docs`
- 백엔드: `npm test`(단위, mock only) · `npm run test:e2e`(Testcontainers, Docker 필요)
- 프론트: `npm run test`(Vitest — `geo.ts`/`mortar.ts` 순수함수)

## 데이터 출처와 한계

- **맵 이미지**: `github.com/pubg/api-assets`(KRAFTON 공식, API 개발자용 리소스)의
  고해상도(8192×8192, 지명 라벨 포함) 원본을 2048px WebP로 압축해 사용.
- **좌표 데이터(고정 스폰/비밀의 방/지하벙커/차고집/글라이더/주유소)**: 공식 API가 이런 정적
  배치 정보를 제공하지 않아, 커뮤니티 자료(나무위키, BGMS 등)를 교차검증해 직접 큐레이션한
  것이다. **전수조사가 아니며 완전하지 않을 수 있고**, 게임 패치·맵 리메이크로 실제와 달라질
  수 있다(대응: `SpawnPoint.isActive`/`lastVerifiedAt`, 관리자 편집모드). BGMS 출처 좌표는
  픽셀 눈대중이 아니라 해당 사이트 Leaflet 마커의 실제 `{lat,lng}`를 스크립트로 직접 추출해
  게임 미터 좌표계(0~8000m)로 수학 변환한 값 — 상세는 `DATA-SOURCES.md` 참고.
- **박격포 유효사거리(121~700m)**: 공식 확정 수치가 아닌 커뮤니티 추정치.
- **전적 데이터**: 공식 `api.pubg.com`에서 직접 조회 — 이 부분만 실제 공식 API 연동이다.

## 배포

프론트: Vercel(예정). 백엔드: Docker 이미지 + 로컬/Render 검토 중. 라이브 링크는 배포
승인 후 추가.
