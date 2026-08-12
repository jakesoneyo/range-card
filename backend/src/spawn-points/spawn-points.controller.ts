import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SpawnPointsService } from './spawn-points.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { AdminSpawnPointQuerySchema } from './dto/admin-query.dto';
import type { AdminSpawnPointQueryDto } from './dto/admin-query.dto';
import { CreateSpawnPointSchema } from './dto/create-spawn-point.dto';
import type { CreateSpawnPointDto } from './dto/create-spawn-point.dto';
import { UpdateSpawnPointSchema } from './dto/update-spawn-point.dto';
import type { UpdateSpawnPointDto } from './dto/update-spawn-point.dto';

/**
 * 관리자 전용 좌표 CRUD — 맵 데이터 유지보수(패치 대응)용.
 * 전 라우트가 JwtAuthGuard로 보호되어 토큰 없이 호출하면 401.
 */
@ApiTags('spawn-points-admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('spawn-points')
export class SpawnPointsController {
  constructor(private readonly spawnPointsService: SpawnPointsService) {}

  @Get()
  @ApiOperation({ summary: '관리자용 좌표 목록 (includeInactive 지원)' })
  findAll(
    @Query(new ZodValidationPipe(AdminSpawnPointQuerySchema))
    query: AdminSpawnPointQueryDto,
  ) {
    return this.spawnPointsService.findAllForAdmin(query);
  }

  @Post()
  @ApiOperation({ summary: '좌표 등록' })
  create(
    @Body(new ZodValidationPipe(CreateSpawnPointSchema))
    dto: CreateSpawnPointDto,
  ) {
    return this.spawnPointsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '좌표 수정 (부분 업데이트)' })
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateSpawnPointSchema))
    dto: UpdateSpawnPointDto,
  ) {
    return this.spawnPointsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: '좌표 삭제' })
  async remove(@Param('id') id: string) {
    await this.spawnPointsService.remove(id);
  }
}
