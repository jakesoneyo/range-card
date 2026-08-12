/** 즐겨찾기 목록 — localStorage 저장, 클릭 시 즉시 재검색. */
import { Star, X } from "lucide-react";
import { useFavoritesStore } from "../../stores/favorites.store";
import type { PlayerShard } from "../../lib/schemas";
import { Panel } from "../ui/Panel";

export function FavoritesList({
  onSelect,
}: {
  onSelect: (params: { shard: PlayerShard; name: string }) => void;
}) {
  const favorites = useFavoritesStore((state) => state.favorites);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);

  if (favorites.length === 0) {
    return <p className="text-sm text-sub">즐겨찾기한 플레이어가 없습니다.</p>;
  }

  return (
    <Panel className="p-4">
      <h2 className="font-wordmark flex items-center gap-1.5 text-sm text-sub">
        <Star size={14} />
        즐겨찾기
      </h2>
      <ul className="mt-2 space-y-1.5">
        {favorites.map((fav) => (
          <li
            key={`${fav.shard}:${fav.playerName}`}
            className="flex items-center justify-between"
          >
            <button
              type="button"
              onClick={() =>
                onSelect({ shard: fav.shard, name: fav.playerName })
              }
              className="font-tabular text-left text-sm text-ink hover:text-accent"
            >
              {fav.playerName}
              <span className="ml-1.5 text-xs text-sub">{fav.shard}</span>
            </button>
            <button
              type="button"
              onClick={() => removeFavorite(fav)}
              aria-label="즐겨찾기 삭제"
              className="text-sub hover:text-marker-secret"
            >
              <X size={14} />
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
