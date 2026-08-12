import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

// 해시 비용 — 시연/개발 환경 응답 속도와 보안 사이 통상적 절충값.
export const BCRYPT_SALT_ROUNDS = 10;

/**
 * Admin 전용 인증. 이 프로젝트엔 일반 사용자 계정이 없다 — 맵 데이터 유지보수
 * 권한을 가진 단일 역할(Admin row 존재 자체가 권한)만 로그인 대상이다.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  /**
   * username/password를 검증하고 액세스 토큰을 발급한다.
   * 비밀번호는 항상 bcrypt.compare로 정상 검증한다 — 우회 경로 없음(CLAUDE.md 보안 원칙).
   * @throws UnauthorizedException username 미존재 또는 비밀번호 불일치 — 계정 존재 여부를
   *   응답으로 구분하지 않기 위해 두 실패를 같은 메시지로 합친다.
   */
  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    const admin = await this.prisma.admin.findUnique({
      where: { username: dto.username },
    });
    const isValid =
      admin && (await bcrypt.compare(dto.password, admin.passwordHash));
    if (!isValid || !admin) {
      throw new UnauthorizedException(
        '아이디 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    const accessToken = await this.jwt.signAsync({
      sub: admin.id,
      username: admin.username,
    });
    return { accessToken };
  }
}
