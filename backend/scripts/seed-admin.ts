/**
 * 관리자 데모 계정 1회성 시드 스크립트.
 *
 * 목적: 면접관이 회원가입 없이 username='admin' / password='admin' 계정으로 로그인해
 * MapViewerPage 구석 자물쇠 아이콘 → AdminLoginModal에서 좌표 편집 기능을 바로 체험하게 한다.
 *
 * 멱등성: admin 계정이 이미 존재하면 아무 것도 하지 않고 종료한다(재실행 안전).
 *
 * 실행 방법 (backend/ 디렉토리에서, 실제 DB 커넥션 문자열로):
 *   npm run seed:admin
 *
 * 주의: 이 스크립트는 애플리케이션 런타임 코드가 아니라 운영자가 직접 실행하는
 * 1회성 데이터 작업이다. 애플리케이션 부팅 경로(main.ts 등)에서 자동 호출하지 않는다.
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '../src/auth/auth.service';

const DEMO_USERNAME = 'admin';
const DEMO_PASSWORD = 'admin';

async function main() {
  const prisma = new PrismaClient();
  try {
    const existing = await prisma.admin.findUnique({
      where: { username: DEMO_USERNAME },
    });
    if (existing) {
      console.log(
        `[seed-admin] admin 계정이 이미 존재합니다 (id=${existing.id}). 스킵.`,
      );
      return;
    }

    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, BCRYPT_SALT_ROUNDS);
    const admin = await prisma.admin.create({
      data: { username: DEMO_USERNAME, passwordHash },
    });

    console.log(`[seed-admin] admin 계정(id=${admin.id})을 생성했습니다.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err: unknown) => {
  console.error('[seed-admin] 시드 실패:', err);
  process.exitCode = 1;
});
