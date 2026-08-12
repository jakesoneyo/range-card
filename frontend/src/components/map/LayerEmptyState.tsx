/** 큐레이션이 아직 안 끝난 (맵, 레이어) 조합용 안내 — 기능 전체를 막지 않고 빈 상태만 표시. */
import { CircleAlert } from "lucide-react";

export function LayerEmptyState({ layerLabel }: { layerLabel: string }) {
  return (
    <p className="flex items-center gap-1.5 text-xs text-sub">
      <CircleAlert size={13} />
      {layerLabel}: 아직 검증된 데이터 없음
    </p>
  );
}
