-- CreateEnum
CREATE TYPE "SpawnPointType" AS ENUM ('VEHICLE_FIXED', 'BOAT_FIXED', 'SECRET_ROOM', 'BUNKER');

-- CreateTable
CREATE TABLE "Map" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sizeM" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageSizePx" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpawnPoint" (
    "id" TEXT NOT NULL,
    "mapId" TEXT NOT NULL,
    "type" "SpawnPointType" NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "sourceUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpawnPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerStatsCache" (
    "id" TEXT NOT NULL,
    "shard" TEXT NOT NULL,
    "playerName" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerStatsCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Map_slug_key" ON "Map"("slug");

-- CreateIndex
CREATE INDEX "SpawnPoint_mapId_type_isActive_idx" ON "SpawnPoint"("mapId", "type", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerStatsCache_shard_playerName_seasonId_key" ON "PlayerStatsCache"("shard", "playerName", "seasonId");

-- AddForeignKey
ALTER TABLE "SpawnPoint" ADD CONSTRAINT "SpawnPoint_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "Map"("id") ON DELETE CASCADE ON UPDATE CASCADE;
