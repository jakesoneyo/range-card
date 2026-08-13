/**
 * 전적검색 — 공식 PUBG API 연동 결과. 로그인 없이 검색+즐겨찾기(localStorage) 가능.
 */
import { useState } from "react";
import { usePlayerStatsSearch } from "../api/playerStats";
import { getApiErrorMessage } from "../api/client";
import type { PlayerShard } from "../lib/schemas";
import { PlayerSearchBar } from "../components/player/PlayerSearchBar";
import { PlayerStatsCard } from "../components/player/PlayerStatsCard";
import { FavoritesList } from "../components/player/FavoritesList";

export function PlayerSearchPage() {
  const [searchParams, setSearchParams] = useState<{
    shard: PlayerShard;
    name: string;
  } | null>(null);

  const { data, isFetching, isError, error } =
    usePlayerStatsSearch(searchParams);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="font-wordmark text-3xl text-ink">전적검색</h1>
      <p className="mt-2 text-sm text-sub">
        공식 PUBG API로 닉네임을 검색합니다. 로그인 없이 즐겨찾기를 저장할 수
        있습니다.
      </p>

      <div className="mt-6">
        <PlayerSearchBar
          initialShard={searchParams?.shard}
          initialName={searchParams?.name}
          onSearch={setSearchParams}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-[1fr_240px]">
        <div>
          {isFetching && <p className="text-sm text-sub">검색 중...</p>}
          {isError && (
            <p className="text-sm text-marker-secret">
              {getApiErrorMessage(error) ||
                "검색에 실패했습니다. 닉네임/샤드를 확인하세요."}
            </p>
          )}
          {data && <PlayerStatsCard stats={data} />}
          {!searchParams && !isFetching && (
            <p className="text-sm text-sub">닉네임을 검색해보세요.</p>
          )}
        </div>
        <FavoritesList onSelect={setSearchParams} />
      </div>
    </div>
  );
}
