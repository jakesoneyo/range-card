/**
 * SpawnPointsService 단위 테스트 — 공개/관리자 필터 조합과 존재하지 않는 id 처리를 검증한다.
 * PrismaService는 인메모리 mock으로 대체.
 */
import { NotFoundException } from '@nestjs/common';
import { SpawnPointType } from '@prisma/client';
import { SpawnPointsService } from './spawn-points.service';

function buildService() {
  const prisma = {
    map: {
      findUnique: jest.fn(),
    },
    spawnPoint: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  const service = new SpawnPointsService(prisma as never);
  return { service, prisma };
}

describe('SpawnPointsService', () => {
  describe('findPublicByMapSlug', () => {
    it('맵이 없으면 NotFoundException', async () => {
      const { service, prisma } = buildService();
      prisma.map.findUnique.mockResolvedValue(null);

      await expect(service.findPublicByMapSlug('no-such-map')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('isActive=true 조건과 type 필터를 where에 반영해 조회한다', async () => {
      const { service, prisma } = buildService();
      prisma.map.findUnique.mockResolvedValue({ id: 'map-1', slug: 'erangel' });

      await service.findPublicByMapSlug('erangel', [
        SpawnPointType.VEHICLE_FIXED,
        SpawnPointType.BOAT_FIXED,
      ]);

      expect(prisma.spawnPoint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            mapId: 'map-1',
            isActive: true,
            type: {
              in: [SpawnPointType.VEHICLE_FIXED, SpawnPointType.BOAT_FIXED],
            },
          },
        }),
      );
    });

    it('type 필터가 없으면 isActive 조건만 건다', async () => {
      const { service, prisma } = buildService();
      prisma.map.findUnique.mockResolvedValue({ id: 'map-1', slug: 'erangel' });

      await service.findPublicByMapSlug('erangel');

      expect(prisma.spawnPoint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { mapId: 'map-1', isActive: true },
        }),
      );
    });
  });

  describe('findAllForAdmin', () => {
    it('includeInactive가 false면 isActive=true 조건이 추가된다', async () => {
      const { service, prisma } = buildService();

      await service.findAllForAdmin({ includeInactive: false });

      expect(prisma.spawnPoint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isActive: true } }),
      );
    });

    it('includeInactive가 true면 isActive 조건이 빠지고 mapId/type만 남는다', async () => {
      const { service, prisma } = buildService();

      await service.findAllForAdmin({
        mapId: 'map-1',
        type: SpawnPointType.BUNKER,
        includeInactive: true,
      });

      expect(prisma.spawnPoint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { mapId: 'map-1', type: SpawnPointType.BUNKER },
        }),
      );
    });
  });

  describe('update/remove', () => {
    it('존재하지 않는 id를 update하면 NotFoundException', async () => {
      const { service, prisma } = buildService();
      prisma.spawnPoint.findUnique.mockResolvedValue(null);

      await expect(
        service.update('missing-id', { label: 'x' }),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.spawnPoint.update).not.toHaveBeenCalled();
    });

    it('존재하지 않는 id를 remove하면 NotFoundException', async () => {
      const { service, prisma } = buildService();
      prisma.spawnPoint.findUnique.mockResolvedValue(null);

      await expect(service.remove('missing-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.spawnPoint.delete).not.toHaveBeenCalled();
    });
  });
});
