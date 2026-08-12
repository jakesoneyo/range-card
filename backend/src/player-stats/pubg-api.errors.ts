/** 검색한 닉네임이 해당 shard에 존재하지 않을 때. 컨트롤러에서 404로 매핑. */
export class PubgPlayerNotFoundError extends Error {
  constructor(name: string) {
    super(`플레이어를 찾을 수 없습니다: ${name}`);
    this.name = 'PubgPlayerNotFoundError';
  }
}

/** 공식 API가 429를 반환했을 때. 서비스가 캐시 폴백을 시도할지 판단하는 데 쓰인다. */
export class PubgRateLimitedError extends Error {
  constructor() {
    super(
      'PUBG 공식 API 레이트리밋에 도달했습니다. 잠시 후 다시 시도해주세요.',
    );
    this.name = 'PubgRateLimitedError';
  }
}

/** 그 외 예기치 못한 API 실패(5xx, 네트워크 오류 등). */
export class PubgApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PubgApiError';
  }
}
