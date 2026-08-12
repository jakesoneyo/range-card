// api.pubg.com은 JSON:API 스펙(https://jsonapi.org)을 따른다 — 응답 최소 형태만 타입화한다
// (전체 payload는 그대로 캐시에 저장되므로 여기서 모든 attribute를 모델링할 필요는 없음).

export interface PubgResource<TAttributes = Record<string, unknown>> {
  id: string;
  type: string;
  attributes: TAttributes;
}

export interface PubgPlayersResponse {
  data: PubgResource<{ name: string }>[];
}

export interface PubgSeasonsResponse {
  data: PubgResource<{ isCurrentSeason: boolean; isOffseason?: boolean }>[];
}

export interface PubgSeasonStatsResponse {
  data: PubgResource<Record<string, unknown>>;
}

/** fetchPlayerStats() 성공 결과 — PlayerStatsService가 캐시 upsert에 그대로 사용한다. */
export interface PubgPlayerStatsResult {
  playerId: string;
  playerName: string;
  seasonId: string;
  payload: PubgSeasonStatsResponse;
}
