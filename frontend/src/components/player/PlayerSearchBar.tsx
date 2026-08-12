/** 닉네임 + 샤드(플랫폼) 검색 폼. 로그인 개념 없음 — 검색은 누구나 즉시 가능. */
import { type FormEvent, useState } from "react";
import { Search } from "lucide-react";
import { PLAYER_SHARDS, type PlayerShard } from "../../lib/schemas";

const SHARD_LABEL: Record<PlayerShard, string> = {
  steam: "Steam",
  kakao: "Kakao",
  psn: "PSN",
  xbox: "Xbox",
};

export function PlayerSearchBar({
  initialShard = "steam",
  initialName = "",
  onSearch,
}: {
  initialShard?: PlayerShard;
  initialName?: string;
  onSearch: (params: { shard: PlayerShard; name: string }) => void;
}) {
  const [shard, setShard] = useState<PlayerShard>(initialShard);
  const [name, setName] = useState(initialName);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    onSearch({ shard, name: name.trim() });
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <select
        value={shard}
        onChange={(e) => setShard(e.target.value as PlayerShard)}
        className="clip-corner-sm border border-border bg-panel-2 px-3 py-2 text-sm text-ink"
      >
        {PLAYER_SHARDS.map((s) => (
          <option key={s} value={s}>
            {SHARD_LABEL[s]}
          </option>
        ))}
      </select>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="닉네임 입력"
        className="clip-corner-sm flex-1 border border-border bg-panel-2 px-3 py-2 text-sm text-ink outline-none focus:border-accent"
      />
      <button
        type="submit"
        className="font-wordmark clip-corner-sm flex items-center gap-1.5 border border-accent bg-accent/15 px-4 py-2 text-sm text-accent hover:bg-accent/25"
      >
        <Search size={15} />
        검색
      </button>
    </form>
  );
}
