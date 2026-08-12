import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MapsService } from './maps.service';

/** 공개(인증 불필요) 맵 목록/상세 조회. 프론트 MapSelectPage/MapViewerPage가 사용. */
@ApiTags('maps')
@Controller('maps')
export class MapsController {
  constructor(private readonly mapsService: MapsService) {}

  @Get()
  @ApiOperation({ summary: '맵 목록 조회' })
  findAll() {
    return this.mapsService.findAll();
  }

  @Get(':slug')
  @ApiOperation({ summary: '맵 상세 조회 (slug)' })
  async findOne(@Param('slug') slug: string) {
    const map = await this.mapsService.findBySlug(slug);
    if (!map) {
      throw new NotFoundException(`맵을 찾을 수 없습니다: ${slug}`);
    }
    return map;
  }
}
