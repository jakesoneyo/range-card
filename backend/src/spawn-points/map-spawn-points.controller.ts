import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SpawnPointsService } from './spawn-points.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { PublicSpawnPointQuerySchema } from './dto/public-query.dto';
import type { PublicSpawnPointQueryDto } from './dto/public-query.dto';

/**
 * 공개(인증 불필요) 레이어 조회 — MapViewerPage가 맵 진입 시/레이어 토글 시 호출.
 * `/maps/:slug/spawn-points`에 매달아 맵 컨텍스트를 URL에 그대로 드러낸다.
 */
@ApiTags('spawn-points')
@Controller('maps/:slug/spawn-points')
export class MapSpawnPointsController {
  constructor(private readonly spawnPointsService: SpawnPointsService) {}

  @Get()
  @ApiOperation({ summary: '맵별 활성 좌표 조회 (콤마로 type 다중 필터)' })
  findByMap(
    @Param('slug') slug: string,
    // 파이프를 메서드 레벨(@UsePipes)에 두면 @Param('slug')에도 적용돼 타입 불일치로
    // 400이 나므로, @Query() 파라미터에만 바인딩한다.
    @Query(new ZodValidationPipe(PublicSpawnPointQuerySchema))
    query: PublicSpawnPointQueryDto,
  ) {
    return this.spawnPointsService.findPublicByMapSlug(slug, query.type);
  }
}
