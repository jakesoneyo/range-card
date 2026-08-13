import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PubgApiError,
  PubgPlayerNotFoundError,
  PubgRateLimitedError,
} from './pubg-api.errors';
import {
  PubgPlayerStatsResult,
  PubgPlayersResponse,
  PubgSeasonsResponse,
  PubgSeasonStatsResponse,
} from './pubg-api.types';

const PUBG_API_BASE_URL = 'https://api.pubg.com';
// 게임모드 무관 통합 시즌 통계 — dak.gg류 사이트가 기본으로 보여주는 값과 동일한 엔드포인트.
const SEASON_STATS_KIND = 'seasons';

/**
 * 공식 api.pubg.com 클라이언트. Bearer 인증 + JSON:API 응답 파싱을 감싸,
 * PlayerStatsService는 "닉네임 → 최신 시즌 통계"만 알면 되도록 한다.
 */
@Injectable()
export class PubgApiClient {
  constructor(private readonly config: ConfigService) {}

  /**
   * 닉네임으로 플레이어를 찾아 현재 시즌 통계까지 한 번에 가져온다(검색 1회 + 시즌목록 1회 + 통계 1회, 총 3 API 콜).
   * @throws PubgPlayerNotFoundError 해당 shard에 닉네임이 존재하지 않을 때
   * @throws PubgRateLimitedError 공식 API가 429를 반환했을 때(서비스가 캐시 폴백 판단에 사용)
   * @throws PubgApiError 그 외 실패
   */
  async fetchPlayerStats(
    shard: string,
    name: string,
  ): Promise<PubgPlayerStatsResult> {
    const player = await this.findPlayerByName(shard, name);
    const seasonId = await this.getCurrentSeasonId(shard);
    const payload = await this.getPlayerSeasonStats(shard, player.id, seasonId);
    return { playerId: player.id, playerName: player.name, seasonId, payload };
  }

  private async findPlayerByName(
    shard: string,
    name: string,
  ): Promise<{ id: string; name: string }> {
    const res = await this.request<PubgPlayersResponse>(
      `/shards/${shard}/players?filter[playerNames]=${encodeURIComponent(name)}`,
      name,
    );
    const player = res.data[0];
    if (!player) {
      throw new PubgPlayerNotFoundError(name);
    }
    return { id: player.id, name: player.attributes.name };
  }

  private async getCurrentSeasonId(shard: string): Promise<string> {
    const res = await this.request<PubgSeasonsResponse>(
      `/shards/${shard}/seasons`,
    );
    const current = res.data.find((s) => s.attributes.isCurrentSeason);
    if (!current) {
      throw new PubgApiError('현재 시즌 정보를 가져오지 못했습니다.');
    }
    return current.id;
  }

  private getPlayerSeasonStats(
    shard: string,
    playerId: string,
    seasonId: string,
  ): Promise<PubgSeasonStatsResponse> {
    return this.request<PubgSeasonStatsResponse>(
      `/shards/${shard}/players/${playerId}/${SEASON_STATS_KIND}/${seasonId}`,
    );
  }

  /**
   * @param notFoundName 404 응답 시 사용자에게 보여줄 이름. 미지정 시 내부 경로 대신
   *   일반 메시지를 사용해 API 경로가 클라이언트로 노출되지 않게 한다.
   */
  private async request<T>(path: string, notFoundName?: string): Promise<T> {
    const apiKey = this.config.get<string>('PUBG_API_KEY');
    if (!apiKey) {
      throw new PubgApiError('PUBG_API_KEY 환경변수가 설정되지 않았습니다.');
    }

    const res = await fetch(`${PUBG_API_BASE_URL}${path}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/vnd.api+json',
      },
    });

    if (res.status === 429) {
      throw new PubgRateLimitedError();
    }
    if (res.status === 404) {
      throw new PubgPlayerNotFoundError(notFoundName ?? '요청한 리소스');
    }
    if (!res.ok) {
      throw new PubgApiError(`PUBG API 요청 실패: ${res.status}`);
    }
    return (await res.json()) as T;
  }
}
