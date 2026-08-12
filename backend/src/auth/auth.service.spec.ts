/**
 * AuthService 단위 테스트 — bcrypt 성공/실패 분기만 검증한다.
 * DB 없이 PrismaService를 인메모리 mock으로 대체(ponytail: 무거운 TestingModule 불필요).
 */
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService, BCRYPT_SALT_ROUNDS } from './auth.service';

interface FakeAdmin {
  id: string;
  username: string;
  passwordHash: string;
}

function buildService(admin: FakeAdmin | null) {
  const prisma = {
    admin: {
      findUnique: jest.fn().mockResolvedValue(admin),
    },
  };
  const signAsync = jest.fn().mockResolvedValue('signed-token');
  const jwt = { signAsync } as unknown as JwtService;

  const service = new AuthService(prisma as never, jwt);
  return { service, prisma, signAsync };
}

describe('AuthService', () => {
  it('올바른 username/password면 액세스 토큰을 발급한다', async () => {
    const passwordHash = await bcrypt.hash('admin', BCRYPT_SALT_ROUNDS);
    const { service, signAsync } = buildService({
      id: 'admin-1',
      username: 'admin',
      passwordHash,
    });

    const result = await service.login({
      username: 'admin',
      password: 'admin',
    });

    expect(result).toEqual({ accessToken: 'signed-token' });
    expect(signAsync).toHaveBeenCalledWith({
      sub: 'admin-1',
      username: 'admin',
    });
  });

  it('존재하지 않는 username이면 UnauthorizedException', async () => {
    const { service } = buildService(null);

    await expect(
      service.login({ username: 'ghost', password: 'whatever' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('비밀번호가 틀리면 UnauthorizedException (bcrypt 비교 실패)', async () => {
    const passwordHash = await bcrypt.hash('admin', BCRYPT_SALT_ROUNDS);
    const { service } = buildService({
      id: 'admin-1',
      username: 'admin',
      passwordHash,
    });

    await expect(
      service.login({ username: 'admin', password: 'wrong-password' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
