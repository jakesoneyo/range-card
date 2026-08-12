/**
 * 큐레이션한 맵 좌표 데이터(backend/data/<slug>.spawn-points.json)를 DB로 upsert하는 스크립트.
 *
 * 지금 커밋된 data/*.json은 실좌표가 아니라 "시드 스크립트 + API 흐름이 end-to-end로
 * 동작하는지"만 확인하려는 placeholder다(label에 명시). 실제 좌표 큐레이션은
 * 관리자 모달 로그인 후 지도 클릭으로 대체하거나, 이 JSON을 사람이 직접 갈아끼운다.
 *
 * 동작:
 *   1. JSON의 `map`을 slug 기준 upsert(없으면 생성, 있으면 메타데이터 갱신).
 *   2. `spawnPoints`는 기본적으로 (mapId, type, label) 조합을 자연키 삼아 upsert —
 *      같은 파일을 재실행해도 중복 생성되지 않는다.
 *   3. `--reset` 플래그를 주면 대상 맵의 기존 SpawnPoint를 전부 지우고 JSON 내용으로 새로 채운다
 *      (좌표를 통째로 다시 찍었을 때처럼, 삭제된 항목이 남아있는 문제를 피하기 위함).
 *
 * 실행 방법 (backend/ 디렉토리에서):
 *   npm run seed:spawn-points            # upsert
 *   npm run seed:spawn-points -- --reset # 전체 초기화 후 재생성
 */
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { PrismaClient, SpawnPointType } from '@prisma/client';

interface SpawnPointSeed {
  type: SpawnPointType;
  x: number;
  y: number;
  label: string;
  description?: string;
  sourceUrl?: string;
}

interface MapSeedFile {
  map: {
    slug: string;
    name: string;
    sizeM: number;
    imageUrl: string;
    imageSizePx: number;
  };
  spawnPoints: SpawnPointSeed[];
}

const DATA_DIR = join(__dirname, '..', 'data');

async function seedOneFile(
  prisma: PrismaClient,
  fileName: string,
  reset: boolean,
) {
  const raw = readFileSync(join(DATA_DIR, fileName), 'utf-8');
  const { map: mapSeed, spawnPoints } = JSON.parse(raw) as MapSeedFile;

  const map = await prisma.map.upsert({
    where: { slug: mapSeed.slug },
    create: mapSeed,
    update: mapSeed,
  });

  if (reset) {
    await prisma.spawnPoint.deleteMany({ where: { mapId: map.id } });
  }

  let created = 0;
  let updated = 0;
  for (const sp of spawnPoints) {
    if (reset) {
      await prisma.spawnPoint.create({ data: { ...sp, mapId: map.id } });
      created++;
      continue;
    }

    // (mapId, type, label) 자연키로 기존 항목을 찾아 갱신, 없으면 생성.
    const existing = await prisma.spawnPoint.findFirst({
      where: { mapId: map.id, type: sp.type, label: sp.label },
    });
    if (existing) {
      await prisma.spawnPoint.update({
        where: { id: existing.id },
        data: sp,
      });
      updated++;
    } else {
      await prisma.spawnPoint.create({ data: { ...sp, mapId: map.id } });
      created++;
    }
  }

  console.log(
    `[seed-spawn-points] ${mapSeed.slug}: 생성 ${created}건, 갱신 ${updated}건`,
  );
}

async function main() {
  const reset = process.argv.includes('--reset');
  const files = readdirSync(DATA_DIR).filter((f) =>
    f.endsWith('.spawn-points.json'),
  );

  if (files.length === 0) {
    console.warn(`[seed-spawn-points] ${DATA_DIR}에 시드 파일이 없습니다.`);
    return;
  }

  const prisma = new PrismaClient();
  try {
    for (const file of files) {
      await seedOneFile(prisma, file, reset);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err: unknown) => {
  console.error('[seed-spawn-points] 시드 실패:', err);
  process.exitCode = 1;
});
