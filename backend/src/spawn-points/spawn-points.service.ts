import { Injectable, NotFoundException } from '@nestjs/common';
import { SpawnPoint, SpawnPointType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AdminSpawnPointQueryDto } from './dto/admin-query.dto';
import { CreateSpawnPointDto } from './dto/create-spawn-point.dto';
import { UpdateSpawnPointDto } from './dto/update-spawn-point.dto';

@Injectable()
export class SpawnPointsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 공개 레이어 조회 — 맵 slug 기준, 활성(isActive=true) 좌표만 노출한다.
   * 비활성화된(검증 실패/제거된) 좌표는 관리자 화면에서만 보인다.
   */
  async findPublicByMapSlug(
    slug: string,
    types?: SpawnPointType[],
  ): Promise<SpawnPoint[]> {
    const map = await this.prisma.map.findUnique({ where: { slug } });
    if (!map) {
      throw new NotFoundException(`맵을 찾을 수 없습니다: ${slug}`);
    }
    return this.prisma.spawnPoint.findMany({
      where: {
        mapId: map.id,
        isActive: true,
        ...(types && types.length > 0 ? { type: { in: types } } : {}),
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /** 관리자 편집 화면용 목록 — includeInactive로 비활성 좌표까지 포함해 조회. */
  findAllForAdmin(query: AdminSpawnPointQueryDto): Promise<SpawnPoint[]> {
    return this.prisma.spawnPoint.findMany({
      where: {
        ...(query.mapId ? { mapId: query.mapId } : {}),
        ...(query.type ? { type: query.type } : {}),
        ...(query.includeInactive ? {} : { isActive: true }),
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /** @throws NotFoundException 대상 mapId가 존재하지 않을 때(FK 위반이 500으로 새는 것을 방지) */
  async create(dto: CreateSpawnPointDto): Promise<SpawnPoint> {
    const map = await this.prisma.map.findUnique({ where: { id: dto.mapId } });
    if (!map) {
      throw new NotFoundException(`맵을 찾을 수 없습니다: ${dto.mapId}`);
    }
    return this.prisma.spawnPoint.create({ data: dto });
  }

  /** @throws NotFoundException 대상 id가 존재하지 않을 때 */
  async update(id: string, dto: UpdateSpawnPointDto): Promise<SpawnPoint> {
    await this.ensureExists(id);
    return this.prisma.spawnPoint.update({ where: { id }, data: dto });
  }

  /** @throws NotFoundException 대상 id가 존재하지 않을 때 */
  async remove(id: string): Promise<void> {
    await this.ensureExists(id);
    await this.prisma.spawnPoint.delete({ where: { id } });
  }

  private async ensureExists(id: string): Promise<void> {
    const found = await this.prisma.spawnPoint.findUnique({ where: { id } });
    if (!found) {
      throw new NotFoundException(`좌표를 찾을 수 없습니다: ${id}`);
    }
  }
}
