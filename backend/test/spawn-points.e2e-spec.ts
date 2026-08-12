import { execSync } from 'child_process';
import type { Server } from 'http';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { BCRYPT_SALT_ROUNDS } from '../src/auth/auth.service';

interface SpawnPointResponseBody {
  id: string;
  label: string;
  isActive: boolean;
}

/**
 * Testcontainers 기반 통합 테스트 — 실제 Postgres 컨테이너 위에서
 * 로그인 → 좌표 생성 → 공개 GET 노출 → isActive=false 처리 → 삭제까지의
 * 관리자 CRUD 핵심 시나리오를 end-to-end로 검증한다.
 * 외부 PUBG API를 건드리지 않는 라우트만 다루므로 PUBG_API_KEY는 불필요.
 */
describe('Spawn points admin CRUD (e2e, Testcontainers Postgres)', () => {
  let container: StartedPostgreSqlContainer;
  let app: INestApplication;
  let httpServer: Server;
  let mapId: string;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16-alpine').start();
    process.env.DATABASE_URL = container.getConnectionUri();
    process.env.JWT_SECRET ??= 'test-secret';

    // 컨테이너에 커밋된 마이그레이션을 그대로 적용(prod과 동일 경로: migrate deploy).
    execSync('npx prisma migrate deploy', {
      cwd: __dirname + '/..',
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
      stdio: 'inherit',
    });

    // 로그인 흐름 테스트를 위해 Admin과 대상 Map을 미리 심어둔다(운영에서는
    // seed-admin.ts/seed-spawn-points.ts가 담당하는 역할).
    const prisma = new PrismaClient();
    const passwordHash = await bcrypt.hash('admin', BCRYPT_SALT_ROUNDS);
    await prisma.admin.create({ data: { username: 'admin', passwordHash } });
    const map = await prisma.map.create({
      data: {
        slug: 'erangel',
        name: 'Erangel',
        sizeM: 8000,
        imageUrl: '/maps/erangel-placeholder.jpg',
        imageSizePx: 2048,
      },
    });
    mapId = map.id;
    await prisma.$disconnect();

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
    httpServer = app.getHttpServer() as Server;
  }, 60_000);

  afterAll(async () => {
    await app?.close();
    await container?.stop();
  });

  it('인증 없이 좌표를 생성하면 401', async () => {
    await request(httpServer)
      .post('/spawn-points')
      .send({
        mapId,
        type: 'BUNKER',
        x: 1,
        y: 2,
        label: '무인증 시도',
      })
      .expect(401);
  });

  it('로그인 → 생성 → 공개 GET 노출 → 비활성화 → 삭제 전체 흐름', async () => {
    const loginRes = await request(httpServer)
      .post('/auth/login')
      .send({ username: 'admin', password: 'admin' })
      .expect(200);
    const { accessToken } = loginRes.body as { accessToken: string };
    expect(accessToken).toBeTruthy();

    const createRes = await request(httpServer)
      .post('/spawn-points')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        mapId,
        type: 'BUNKER',
        x: 123,
        y: 456,
        label: 'e2e 테스트 벙커',
      })
      .expect(201);
    const created = createRes.body as SpawnPointResponseBody;
    expect(created.isActive).toBe(true);

    const publicListAfterCreate = await request(httpServer)
      .get('/maps/erangel/spawn-points?type=BUNKER')
      .expect(200);
    expect(
      (publicListAfterCreate.body as SpawnPointResponseBody[]).some(
        (sp) => sp.id === created.id,
      ),
    ).toBe(true);

    await request(httpServer)
      .patch(`/spawn-points/${created.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ isActive: false })
      .expect(200);

    const publicListAfterDeactivate = await request(httpServer)
      .get('/maps/erangel/spawn-points?type=BUNKER')
      .expect(200);
    expect(
      (publicListAfterDeactivate.body as SpawnPointResponseBody[]).some(
        (sp) => sp.id === created.id,
      ),
    ).toBe(false);

    const adminListIncludeInactive = await request(httpServer)
      .get(`/spawn-points?mapId=${mapId}&includeInactive=true`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(
      (adminListIncludeInactive.body as SpawnPointResponseBody[]).some(
        (sp) => sp.id === created.id,
      ),
    ).toBe(true);

    await request(httpServer)
      .delete(`/spawn-points/${created.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);

    const adminListAfterDelete = await request(httpServer)
      .get(`/spawn-points?mapId=${mapId}&includeInactive=true`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(
      (adminListAfterDelete.body as SpawnPointResponseBody[]).some(
        (sp) => sp.id === created.id,
      ),
    ).toBe(false);
  });
});
