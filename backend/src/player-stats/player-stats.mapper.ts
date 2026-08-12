/**
 * PUBG 공식 API의 JSON:API 원본 payload(`data.attributes.gameModeStats`)를
 * 프론트가 그대로 렌더링할 수 있는 게임모드별 통계 배열로 정규화한다.
 * DB(PlayerStatsCache.payload)에는 원본을 그대로 저장하고, HTTP 응답 시점에만 이 변환을 거친다
 * — 원본을 보존해야 API 스펙 변경/디버깅에 대응할 수 있기 때문.
 */
export interface PlayerModeStats {
  mode: string;
  roundsPlayed: number;
  wins: number;
  top10s: number;
  kills: number;
  assists: number;
  headshotKills: number;
  longestKillM: number;
}

function readNumber(stats: Record<string, unknown>, key: string): number {
  const value = stats[key];
  return typeof value === 'number' ? value : 0;
}

function extractGameModeStats(
  payload: unknown,
): Record<string, unknown> | null {
  if (!payload || typeof payload !== 'object') return null;
  const data = (payload as Record<string, unknown>).data;
  if (!data || typeof data !== 'object') return null;
  const attributes = (data as Record<string, unknown>).attributes;
  if (!attributes || typeof attributes !== 'object') return null;
  const gameModeStats = (attributes as Record<string, unknown>).gameModeStats;
  return gameModeStats && typeof gameModeStats === 'object'
    ? (gameModeStats as Record<string, unknown>)
    : null;
}

/** payload가 예상 형태가 아니면(구버전 캐시, API 변경 등) 빈 배열을 반환한다 — 절대 throw하지 않음. */
export function toPlayerModeStats(payload: unknown): PlayerModeStats[] {
  const gameModeStats = extractGameModeStats(payload);
  if (!gameModeStats) return [];

  return Object.entries(gameModeStats)
    .filter(
      (entry): entry is [string, Record<string, unknown>] =>
        typeof entry[1] === 'object' && entry[1] !== null,
    )
    .map(([mode, stats]) => ({
      mode,
      roundsPlayed: readNumber(stats, 'roundsPlayed'),
      wins: readNumber(stats, 'wins'),
      top10s: readNumber(stats, 'top10s'),
      kills: readNumber(stats, 'kills'),
      assists: readNumber(stats, 'assists'),
      headshotKills: readNumber(stats, 'headshotKills'),
      longestKillM: readNumber(stats, 'longestKill'),
    }));
}
