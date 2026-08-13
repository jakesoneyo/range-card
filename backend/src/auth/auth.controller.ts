import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginSchema } from './dto/login.dto';
import type { LoginDto } from './dto/login.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

// 브루트포스 방어 — 전역 스로틀(분당 1000회)만으로는 비밀번호 무차별 대입을 막지 못한다.
const LOGIN_THROTTLE_LIMIT = 10;
const LOGIN_THROTTLE_TTL_MS = 60_000;

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** 관리자 아이디/비밀번호 로그인. 성공 시 액세스 토큰 발급. */
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: '관리자 로그인' })
  @Throttle({
    default: { limit: LOGIN_THROTTLE_LIMIT, ttl: LOGIN_THROTTLE_TTL_MS },
  })
  login(@Body(new ZodValidationPipe(LoginSchema)) dto: LoginDto) {
    return this.authService.login(dto);
  }
}
