import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { MapsModule } from './maps/maps.module';
import { SpawnPointsModule } from './spawn-points/spawn-points.module';
import { PlayerStatsModule } from './player-stats/player-stats.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // 기본 리밋은 넉넉하게 두고(다른 라우트에 영향 없음), player-stats.controller의
    // @Throttle이 검색 엔드포인트만 분당 8회로 좁혀 덮어쓴다.
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 1000 }]),
    PrismaModule,
    HealthModule,
    AuthModule,
    MapsModule,
    SpawnPointsModule,
    PlayerStatsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
