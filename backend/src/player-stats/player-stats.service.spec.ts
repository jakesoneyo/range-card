/**
 * PlayerStatsService 단위 테스트 — 캐시 히트/미스, TTL 만료, 레이트리밋 폴백을 검증한다.
 * PubgApiClient(외부 API)는 완전히 mock — 네트워크 호출 없이 그린이어야 한다.
 */
import { NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import {
  PlayerStatsService,
  PLAYER_STATS_CACHE_TTL_MS,
} from './player-stats.service';
import {
  PubgPlayerNotFoundError,
  PubgRateLimitedError,
} from './pubg-api.errors';

function buildService() {
  const prisma = {
    playerStatsCache: {
      findFirst: jest.fn(),
      upsert: jest.fn(),
    },
  };
  // PubgApiClient 타입으로 캐스팅하지 않는다 — 클래스 타입으로 캐스팅하면
  // eslint(@typescript-eslint/unbound-method)가 jest.fn() 참조를 언바운드 메서드로
  // 오인해 경고한다. 순수 mock 객체로만 다룬다.
  const pubgApiClient = {
    fetchPlayerStats: jest.fn(),
  };

  const service = new PlayerStatsService(
    prisma as never,
    pubgApiClient as never,
  );
  return { service, prisma, pubgApiClient };
}

// 실제 api.pubg.com 시즌 통계 응답의 최소 골격 — mapper가 gameModeStats를 modes[]로 정규화하는지도 함께 검증.
const RAW_PAYLOAD = {
  data: {
    type: 'playerSeason',
    id: 'p1',
    attributes: {
      gameModeStats: {
        squad: {
          roundsPlayed: 10,
          wins: 2,
          top10s: 5,
          kills: 20,
          assists: 3,
          headshotKills: 4,
          longestKill: 123.4,
        },
      },
    },
  },
};

const CACHE_ROW = {
  id: 'cache-1',
  shard: 'steam',
  playerName: 'shroud',
  seasonId: 'season-1',
  payload: RAW_PAYLOAD,
  fetchedAt: new Date(),
};

describe('PlayerStatsService', () => {
  it('캐시가 TTL 이내면 외부 API를 호출하지 않고 캐시를 반환한다(stale=false)', async () => {
    const { service, prisma, pubgApiClient } = buildService();
    prisma.playerStatsCache.findFirst.mockResolvedValue({ ...CACHE_ROW });

    const result = await service.search('steam', 'shroud');

    expect(result.stale).toBe(false);
    expect(result.modes).toEqual([
      {
        mode: 'squad',
        roundsPlayed: 10,
        wins: 2,
        top10s: 5,
        kills: 20,
        assists: 3,
        headshotKills: 4,
        longestKillM: 123.4,
      },
    ]);
    expect(pubgApiClient.fetchPlayerStats).not.toHaveBeenCalled();
  });

  it('캐시가 TTL을 지났으면 외부 API를 호출하고 캐시를 갱신한다', async () => {
    const { service, prisma, pubgApiClient } = buildService();
    const staleRow = {
      ...CACHE_ROW,
      fetchedAt: new Date(Date.now() - PLAYER_STATS_CACHE_TTL_MS - 1000),
    };
    prisma.playerStatsCache.findFirst.mockResolvedValue(staleRow);
    pubgApiClient.fetchPlayerStats.mockResolvedValue({
      playerId: 'p1',
      playerName: 'shroud',
      seasonId: 'season-2',
      payload: RAW_PAYLOAD,
    });
    prisma.playerStatsCache.upsert.mockResolvedValue({
      ...CACHE_ROW,
      seasonId: 'season-2',
      fetchedAt: new Date(),
    });

    const result = await service.search('steam', 'shroud');

    expect(pubgApiClient.fetchPlayerStats).toHaveBeenCalledWith(
      'steam',
      'shroud',
    );
    expect(result.stale).toBe(false);
    expect(result.seasonId).toBe('season-2');
  });

  it('캐시가 아예 없으면(미스) 외부 API를 호출한다', async () => {
    const { service, prisma, pubgApiClient } = buildService();
    prisma.playerStatsCache.findFirst.mockResolvedValue(null);
    pubgApiClient.fetchPlayerStats.mockResolvedValue({
      playerId: 'p1',
      playerName: 'shroud',
      seasonId: 'season-1',
      payload: RAW_PAYLOAD,
    });
    prisma.playerStatsCache.upsert.mockResolvedValue({ ...CACHE_ROW });

    const result = await service.search('steam', 'shroud');

    expect(result.stale).toBe(false);
    expect(prisma.playerStatsCache.upsert).toHaveBeenCalled();
  });

  it('플레이어를 찾지 못하면 NotFoundException', async () => {
    const { service, prisma, pubgApiClient } = buildService();
    prisma.playerStatsCache.findFirst.mockResolvedValue(null);
    pubgApiClient.fetchPlayerStats.mockRejectedValue(
      new PubgPlayerNotFoundError('ghost'),
    );

    await expect(service.search('steam', 'ghost')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('레이트리밋이면서 만료된 캐시가 있으면 캐시로 폴백한다(stale=true)', async () => {
    const { service, prisma, pubgApiClient } = buildService();
    const staleRow = {
      ...CACHE_ROW,
      fetchedAt: new Date(Date.now() - PLAYER_STATS_CACHE_TTL_MS - 1000),
    };
    prisma.playerStatsCache.findFirst.mockResolvedValue(staleRow);
    pubgApiClient.fetchPlayerStats.mockRejectedValue(
      new PubgRateLimitedError(),
    );

    const result = await service.search('steam', 'shroud');

    expect(result.stale).toBe(true);
    expect(prisma.playerStatsCache.upsert).not.toHaveBeenCalled();
  });

  it('레이트리밋이고 캐시도 없으면 ServiceUnavailableException', async () => {
    const { service, prisma, pubgApiClient } = buildService();
    prisma.playerStatsCache.findFirst.mockResolvedValue(null);
    pubgApiClient.fetchPlayerStats.mockRejectedValue(
      new PubgRateLimitedError(),
    );

    await expect(service.search('steam', 'shroud')).rejects.toThrow(
      ServiceUnavailableException,
    );
  });
});
