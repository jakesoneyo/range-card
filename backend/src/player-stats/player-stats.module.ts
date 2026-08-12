import { Module } from '@nestjs/common';
import { PlayerStatsController } from './player-stats.controller';
import { PlayerStatsService } from './player-stats.service';
import { PubgApiClient } from './pubg-api.client';

@Module({
  controllers: [PlayerStatsController],
  providers: [PlayerStatsService, PubgApiClient],
})
export class PlayerStatsModule {}
