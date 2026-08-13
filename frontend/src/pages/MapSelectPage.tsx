/**
 * 맵 선택 — 에란겔/미라마/론도/태이고 카드 그리드. GET /maps 결과를 그대로 렌더링한다
 * (맵 4종 고정 하드코딩 대신 API가 서빙하는 목록을 신뢰 — 시딩 전이면 자연히 빈 목록).
 */
import { Link } from "react-router";
import { Map as MapIcon } from "lucide-react";
import { useMaps } from "../api/maps";
import { Panel } from "../components/ui/Panel";
import { useImageLoadState } from "../lib/useImageLoadState";
import type { MapEntity } from "../lib/schemas";

/** 카드 썸네일 — map.imageUrl 로드 성공 시 실제 지도 이미지, 실패/로딩 중엔 아이콘 placeholder. */
function MapThumbnail({ map }: { map: MapEntity }) {
  const imageState = useImageLoadState(map.imageUrl);

  if (imageState === "loaded") {
    return (
      <img
        src={map.imageUrl}
        alt={map.name}
        className="aspect-square w-full object-cover"
      />
    );
  }

  return (
    <div className="flex aspect-square items-center justify-center bg-panel-2 text-sub">
      <MapIcon size={40} strokeWidth={1.25} />
    </div>
  );
}

export function MapSelectPage() {
  const { data: maps, isLoading, isError } = useMaps();

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="font-wordmark text-3xl text-ink">맵 선택</h1>
      <p className="mt-2 text-sm text-sub">
        고정 스폰·비밀의 방 오버레이와 박격포 사거리 계산기를 사용할 맵을
        고르세요.
      </p>

      {isLoading && (
        <p className="mt-8 text-sm text-sub">맵 목록을 불러오는 중...</p>
      )}
      {isError && (
        <p className="mt-8 text-sm text-marker-secret">
          맵 목록을 불러오지 못했습니다. 백엔드 연결 상태를 확인하세요.
        </p>
      )}
      {maps?.length === 0 && (
        <p className="mt-8 text-sm text-sub">등록된 맵이 아직 없습니다.</p>
      )}

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {maps?.map((map) => (
          <Link key={map.id} to={`/maps/${map.slug}`}>
            <Panel className="group h-full transition-colors hover:border-accent">
              <MapThumbnail map={map} />
              <div className="p-4">
                <h2 className="font-wordmark text-lg text-ink group-hover:text-accent">
                  {map.name}
                </h2>
                <p className="font-tabular mt-1 text-xs text-sub">
                  {map.sizeM.toLocaleString()}m × {map.sizeM.toLocaleString()}m
                </p>
              </div>
            </Panel>
          </Link>
        ))}
      </div>
    </div>
  );
}
