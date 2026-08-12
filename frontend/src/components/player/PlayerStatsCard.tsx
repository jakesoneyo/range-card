/** 전적 검색 결과 카드 — 게임모드별 시즌 통계 + 즐겨찾기 별 토글. */
import { Star } from "lucide-react";
import type { PlayerStatsResponse } from "../../lib/schemas";
import { useFavoritesStore } from "../../stores/favorites.store";
import type { PlayerShard } from "../../lib/schemas";
import { Panel } from "../ui/Panel";
import { Badge } from "../ui/Badge";

export function PlayerStatsCard({ stats }: { stats: PlayerStatsResponse }) {
  const favorite = {
    shard: stats.shard as PlayerShard,
    playerName: stats.playerName,
  };
  const isFavorite = useFavoritesStore((state) => state.isFavorite(favorite));
  const addFavorite = useFavoritesStore((state) => state.addFavorite);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);

  return (
    <Panel className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-wordmark text-xl text-ink">{stats.playerName}</h2>
          <p className="text-xs text-sub">
            {stats.shard.toUpperCase()} · 시즌 {stats.seasonId}
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            isFavorite ? removeFavorite(favorite) : addFavorite(favorite)
          }
          aria-label={isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
          className={isFavorite ? "text-accent" : "text-sub hover:text-accent"}
        >
          <Star size={20} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>

      {stats.stale && (
        <p className="mt-2 text-xs text-sub">
          외부 API 요청이 몰려 캐시된 데이터를 표시 중입니다. 최신 정보와 다를
          수 있습니다.
        </p>
      )}

      <div className="mt-4 space-y-3">
        {stats.modes.map((mode) => {
          const winRate =
            mode.roundsPlayed > 0 ? (mode.wins / mode.roundsPlayed) * 100 : 0;
          const kd =
            mode.roundsPlayed - mode.wins > 0
              ? mode.kills / (mode.roundsPlayed - mode.wins)
              : mode.kills;
          return (
            <div key={mode.mode} className="border-t border-border pt-3">
              <Badge tone="sub">{mode.mode}</Badge>
              <dl className="font-tabular mt-2 grid grid-cols-3 gap-2 text-sm sm:grid-cols-6">
                <Stat label="라운드" value={mode.roundsPlayed} />
                <Stat label="승리" value={mode.wins} />
                <Stat label="승률" value={`${winRate.toFixed(1)}%`} />
                <Stat label="Top10" value={mode.top10s} />
                <Stat label="킬" value={mode.kills} />
                <Stat label="K/D" value={kd.toFixed(2)} />
              </dl>
            </div>
          );
        })}
        {stats.modes.length === 0 && (
          <p className="text-sm text-sub">이번 시즌 플레이 기록이 없습니다.</p>
        )}
      </div>
    </Panel>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="font-sans text-[11px] text-sub">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}
