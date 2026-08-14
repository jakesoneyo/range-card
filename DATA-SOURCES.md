# PUBG 관련 API/데이터 소스 정리

이 프로젝트(range-card)가 쓸 수 있는 PUBG 관련 API·저장소·커뮤니티 사이트를 신뢰도별로 정리한
자료다. 인게임 캡처 재개, 좌표 데이터 추가 큐레이션 등 다음 작업 시작할 때 여기서부터 보면 된다.

---

## 🟢 안전 — 공식이거나 공식 API만 감싼 것

### `api.pubg.com` (공식 개발자 API)

- developer.pubg.com에서 무료 키 발급. 분당 10req(개발용 기본값), 상향 신청 가능.
- 전적/시즌통계/텔레메트리 제공. **맵 정적 배치(스폰 위치 등)는 제공 안 함.**
- 상업적 이용도 ToS만 지키면 허용된다고 FAQ에 명시돼 있음.
- 우리 프로젝트의 `player-stats` 모듈이 이걸 직접 씀.

### `github.com/pubg/api-assets`

- 공식 GitHub. "Official Resources for PUBG API Developers".
- 무기/아이템 아이콘, 맵 이미지(Main/No_Text × High_Res/Low_Res), 텔레메트리 딕셔너리.
- **주의: 맵 이미지 마지막 갱신 2024-10-28(패치 31.2)** — 저장소 자체 마지막 커밋도 이 날짜.
  현재 패치(42.3)까지 22개월+ 격차. 론도는 42.2 지형 개편분이 통째로 미반영.
  최신 콘텐츠(예: 42.3 신규무기 RPD)는 당연히 없음 — 확인 완료.
- 우리 지도 이미지가 지금 여기서 온 것. **인게임 직접 캡처로 교체 예정.**

### `documentation.pubg.com/en/community-sdks.html` 등재 SDK

PUBG 공식 개발자 문서가 직접 링크해둔 커뮤니티 API 래퍼 목록(공식 인증 마크는 없지만, 회사가
스스로 문서에 링크해뒀다는 점에서 사실상 용인/권장에 가까움). 전부 `api.pubg.com`을 감싸기만
할 뿐 게임 파일 추출은 안 함 — 법적으로 완전히 안전한 카테고리.

| 언어    | 이름               | 링크                                      |
| ------- | ------------------ | ----------------------------------------- |
| Node.js | pubg.js            | github.com/ickerio/pubg.js                |
| GraphQL | PubgRecords-server | github.com/JadTermsani/PubgRecords-server |
| Go      | pubg               | github.com/NovikovRoman/pubg              |
| Python  | pubg-python        | github.com/ramonsaraiva/pubg-python       |
| Python  | pubgy              | github.com/Discord-ian/pubgy              |
| Python  | chicken-dinner     | github.com/crflynn/chicken-dinner         |
| C#/.NET | pubg-dotnet        | github.com/GavinPower747/pubg-dotnet      |
| PHP     | pubg-php-api       | github.com/samiaraboglu/pubg-php-api      |

우리는 자체 `pubg-api.client.ts`를 직접 짰지만(ponytail 상 그게 더 단순했음), 참고/디버깅용으로
쓸만함.

### dak.gg/pubg

- **2025년 4월부터 PUBG e스포츠와 공식 파트너십** 체결(글로벌 파워랭킹 공식 제공).
- 전적 데이터는 공식 API 기반으로 확인됨. 운영사 BigPicture Interactive.
- 맵/스폰 정보는 다루지 않는 사이트(전적검색 전문).

### op.gg/pubg (구 pubg.op.gg)

- OP.GG 본사가 운영하는 대형 검증된 서비스, 공식 API 기반 전적조회.
- 마찬가지로 맵 스폰 데이터는 취급 안 함.

---

## 🟡 회색지대 — 오래 운영됐고 사실상 용인되지만, 데이터 출처가 불투명

### bgms.kr (BGMS)

- **이번 프로젝트의 좌표 데이터 출처.** 고정차량/차고지/비밀의방 등 우리와 동일한 분류체계로
  Leaflet 기반 인터랙티브 지도 제공. 패치 42.3 배너까지 달려있어 갱신은 꾸준한 편.
- 전적검색 기능도 있어 그쪽은 공식 API 기반일 가능성 높음. **맵 스폰 좌표 자체의 원출처(직접
  현장검증인지, 자체 데이터마이닝인지)는 사이트에 명시돼 있지 않음** — 그래서 "이미지를 저장하지
  않고 좌표 사실만 옮겨 찍는다"는 원칙을 지켰음(이 프로젝트 전체에서 일관되게 적용한 방침).
- **맵 배경 이미지 자체의 출처도 불명** — 우리는 이 이미지를 쓴 적 없고 마커 좌표만 가져왔음.

### pubgmaps.gg (운영: Bitbyte AS)

- BGMS보다 훨씬 정교한 인터랙티브 지도. 차량 스폰만 8개 세부 카테고리(Esports/Road/Picobus/
  Esports Boat/Motorglider/Offroad/Road Plus/Garage), 3D 모드, 리플레이 기능, 10개 언어 지원.
- **자체 About 페이지에 명시**: "지도 이미지·데이터는 생성형 AI(이미지 인페인팅+3D 메시 생성)
  ·OCR·컴퓨터비전을 쓰는 자체 파이프라인으로 만듦. 지형·텍스처·차량스폰·지명 어디든 오류가
  섞일 수 있고, **게임 업데이트보다 데이터가 뒤처질 수 있음**. 완벽한 사본이 아니라 근사
  참고자료로만 취급할 것." (원문 자기 고지)
- KRAFTON Content Creation Guidelines 하에 운영한다고 명시, 회사명(Bitbyte AS) 걸고 운영 —
  익명 팬사이트보다 신뢰도가 좀 더 있음. 다만 **본인들도 패치 반영 지연을 인정**하므로 론도
  42.2 같은 최신 개편 반영 여부를 보장 못 함. 이미지 자체도 Bitbyte 소유물이라 별도 허락 없이
  가져다 쓰는 건 또 다른 라이선스 문제가 됨 — 참고용 크로스체크 사이트 정도로만 취급.

---

## 🔴 위험 — 명시적으로 게임 파일 데이터마이닝 기반

이런 데이터를 **다시 그대로 가져다 쓰는 건 피할 것** — 텍스트로 서술된 사실(지명 등)만 교차
확인용으로 참고하고, 이미지/마커를 그대로 복제하지 않는다.

| 사이트/저장소                  | 근거                                                                                                |
| ------------------------------ | --------------------------------------------------------------------------------------------------- |
| battlegrounds.party/map        | 페이지 제목부터 "PUBG **Datamined** Map"                                                            |
| pubgmap.io                     | 스스로 "unofficial" 명시, 차량/루트 스폰 데이터마이닝 명시                                          |
| gamermaps.net                  | 출처 불명 다중게임 지도 애그리게이터, 데이터마이닝 추정                                             |
| pubgintel.com                  | "every marker extracted directly from PUBG's game files" 명시                                       |
| github.com/cgcostume/pubg-maps | 게임 PAK 파일에서 하이트맵/텍스처 직접 추출하는 **도구 자체** — 우리가 이미 "안 한다"고 결정한 방식 |

---

## 이 프로젝트에 적용한 원칙 (요약)

1. **전적검색**: 무조건 공식 `api.pubg.com` 직접 호출. 우회/데이터마이닝 없음.
2. **맵 좌표(고정 스폰 등)**: 🟡 회색지대(BGMS)에서 **좌표 "사실"만** 추출 — 이미지는 절대
   저장·재사용하지 않고, 텍스트/스크립트로 위치값만 옮겨 찍음.
3. **맵 배경 이미지**: 공식(`pubg/api-assets`)이 최선이지만 22개월 구버전이라는 게 확인됨 →
   **인게임 직접 캡처로 전환 예정**(가장 안전하고, 가장 최신).
4. **🔴 티어는 아예 참고 안 함** — 이미지든 좌표든.

## 다음 세션에서 할 일

- [ ] 4개 맵(에란겔/미라마/론도/태이고) 인게임 직접 캡처 (M키 전체지도 + N키 줌 + Alt+1 HUD제거)
- [ ] 새 캡처 이미지로 `frontend/public/maps/*.webp` 교체, `imageSizePx` 재계산
- [ ] 기존 BGMS 좌표(202개, 게임 좌표 0~8000m 기준 정확 변환됨)를 새 이미지 크기에 맞게 재스케일
      — 좌표 자체는 정확하므로 이미지 교체 시 재작업 불필요, 스케일 비율만 다시 계산하면 됨
- [ ] 론도는 42.2 개편분(신규 도로/건물) 반영된 최신 상태로 캡처되므로, 스폰 데이터도 그 시점
      기준인지 BGMS에서 한 번 더 대조 확인
