import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { PlayerStatsService } from './player-stats.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { SearchPlayerStatsQuerySchema } from './dto/search-query.dto';
import type { SearchPlayerStatsQueryDto } from './dto/search-query.dto';

// 공식 API 예산(10req/분)에 여유 버퍼를 두고 분당 8회로 제한 — 여러 탭이 동시에 몰려도 초과하지 않게.
const SEARCH_THROTTLE_LIMIT = 8;
const SEARCH_THROTTLE_TTL_MS = 60_000;

@ApiTags('player-stats')
@Controller('player-stats')
export class PlayerStatsController {
  constructor(private readonly playerStatsService: PlayerStatsService) {}

  @Get('search')
  @ApiOperation({
    summary: 'PUBG 공식 API 전적검색 (캐시 우선, 분당 8회 제한)',
  })
  @Throttle({
    default: { limit: SEARCH_THROTTLE_LIMIT, ttl: SEARCH_THROTTLE_TTL_MS },
  })
  search(
    @Query(new ZodValidationPipe(SearchPlayerStatsQuerySchema))
    query: SearchPlayerStatsQueryDto,
  ) {
    return this.playerStatsService.search(query.shard, query.name);
  }
}
