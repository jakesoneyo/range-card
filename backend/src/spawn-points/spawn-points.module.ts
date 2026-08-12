import { Module } from '@nestjs/common';
import { MapSpawnPointsController } from './map-spawn-points.controller';
import { SpawnPointsController } from './spawn-points.controller';
import { SpawnPointsService } from './spawn-points.service';

@Module({
  controllers: [MapSpawnPointsController, SpawnPointsController],
  providers: [SpawnPointsService],
})
export class SpawnPointsModule {}
