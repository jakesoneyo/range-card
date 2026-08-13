import {
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PubgApiClient } from './pubg-api.client';
import {
  PubgApiError,
  PubgPlayerNotFoundError,
  PubgRateLimitedError,
} from './pubg-api.errors';
import { PlayerModeStats, toPlayerModeStats } from './player-stats.mapper';

// 전적은 실시간성이 낮아 10분 캐시로도 체감 지연이 없다 — 공식 API 10req/분 예산을 보호하는 핵심 장치.
export const PLAYER_STATS_CACHE_TTL_MS = 10 * 60 * 1000;

export interface PlayerStatsSearchResult {
  shard: string;
  playerName: string;
  seasonId: string;
  cachedAt: Date;
  // true = 429 레이트리밋으로 만료된 캐시를 폴백한 응답 — 프론트가 "최신 데이터 아닐 수 있음" 안내에 사용.
  // 정상 TTL 이내 캐시 히트/신규 조회는 false.
  stale: boolean;
  modes: PlayerModeStats[];
}

@Injectable()
export class PlayerStatsService {
  private readonly logger = new Logger(PlayerStatsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pubgApiClient: PubgApiClient,
  ) {}

  /**
   * 캐시 우선 조회 → TTL(10분) 이내면 즉시 반환 → 미스면 공식 API 호출 후 캐시 저장.
   * 시즌 ID는 API 호출 전엔 알 수 없으므로, 캐시 키는 (shard, playerName)로 가장 최근 값을
   * 먼저 찾고 TTL만 검사한다(시즌은 몇 달에 한 번만 바뀌므로 이 근사가 실용적이다).
   * @throws NotFoundException 닉네임이 존재하지 않을 때(캐시에도 없을 때)
   * @throws ServiceUnavailableException 공식 API가 레이트리밋(429)이고 폴백할 캐시도 없을 때,
   *   또는 PUBG_API_KEY 미설정 등 연동 자체가 불가능할 때
   */
  async search(shard: string, name: string): Promise<PlayerStatsSearchResult> {
    const cached = await this.prisma.playerStatsCache.findFirst({
      where: { shard, playerName: name },
      orderBy: { fetchedAt: 'desc' },
    });

    const isFresh =
      cached &&
      Date.now() - cached.fetchedAt.getTime() < PLAYER_STATS_CACHE_TTL_MS;
    if (cached && isFresh) {
      return { ...this.toResult(cached), stale: false };
    }

    try {
      const fetched = await this.pubgApiClient.fetchPlayerStats(shard, name);
      // JSON:API 원본 응답을 그대로 저장 — Prisma의 Json 필드는 인덱스 시그니처가
      // 없는 구체적 타입을 그대로 받지 않으므로 InputJsonValue로 명시 변환한다.
      const payload = fetched.payload as unknown as Prisma.InputJsonValue;
      const saved = await this.prisma.playerStatsCache.upsert({
        where: {
          shard_playerName_seasonId: {
            shard,
            playerName: fetched.playerName,
            seasonId: fetched.seasonId,
          },
        },
        create: {
          shard,
          playerName: fetched.playerName,
          seasonId: fetched.seasonId,
          payload,
        },
        update: {
          payload,
          fetchedAt: new Date(),
        },
      });
      return { ...this.toResult(saved), stale: false };
    } catch (err) {
      if (err instanceof PubgPlayerNotFoundError) {
        throw new NotFoundException(err.message);
      }
      if (err instanceof PubgRateLimitedError) {
        // 레이트리밋에 걸려도 만료된 캐시라도 있으면 완전 실패보다 낫다 — stale 폴백.
        if (cached) {
          this.logger.warn(
            `레이트리밋 발생, stale 캐시로 폴백 (shard=${shard}, name=${name})`,
          );
          return { ...this.toResult(cached), stale: true };
        }
        throw new ServiceUnavailableException(err.message);
      }
      if (err instanceof PubgApiError) {
        // 키 미설정·현재시즌 조회 실패 등 "우리 쪽 PUBG 연동이 지금 응답할 수 없음" 부류 —
        // 클라이언트 요청 자체는 잘못이 없으므로 500(우리 버그)이 아니라 503으로 알린다.
        throw new ServiceUnavailableException(err.message);
      }
      throw err;
    }
  }

  private toResult(row: {
    shard: string;
    playerName: string;
    seasonId: string;
    payload: unknown;
    fetchedAt: Date;
  }): Omit<PlayerStatsSearchResult, 'stale'> {
    return {
      shard: row.shard,
      playerName: row.playerName,
      seasonId: row.seasonId,
      cachedAt: row.fetchedAt,
      modes: toPlayerModeStats(row.payload),
    };
  }
}
