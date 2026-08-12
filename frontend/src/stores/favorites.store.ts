/**
 * 전적검색 즐겨찾기 — 로그인 개념 없이 localStorage에만 저장(계정/서버 저장 없음).
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PlayerShard } from "../lib/schemas";

export interface FavoritePlayer {
  shard: PlayerShard;
  playerName: string;
}

function sameFavorite(a: FavoritePlayer, b: FavoritePlayer) {
  return a.shard === b.shard && a.playerName === b.playerName;
}

interface FavoritesState {
  favorites: FavoritePlayer[];
  addFavorite: (fav: FavoritePlayer) => void;
  removeFavorite: (fav: FavoritePlayer) => void;
  isFavorite: (fav: FavoritePlayer) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (fav) =>
        set((state) =>
          state.favorites.some((f) => sameFavorite(f, fav))
            ? state
            : { favorites: [...state.favorites, fav] },
        ),
      removeFavorite: (fav) =>
        set((state) => ({
          favorites: state.favorites.filter((f) => !sameFavorite(f, fav)),
        })),
      isFavorite: (fav) => get().favorites.some((f) => sameFavorite(f, fav)),
    }),
    { name: "range-card-favorites" },
  ),
);
