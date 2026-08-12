/**
 * 관리자 편집 패널 — 로그인 후 admin-edit 모드에서만 노출. 지도 클릭으로 받은 좌표를
 * 좌표입력 폼에 채워 스폰 포인트를 추가하고, 기존 포인트를 활성/비활성·삭제한다.
 */
import { type FormEvent, useState } from "react";
import { Trash2 } from "lucide-react";
import {
  useAdminSpawnPoints,
  useCreateSpawnPoint,
  useDeleteSpawnPoint,
  useUpdateSpawnPoint,
} from "../../api/spawnPoints";
import { useMapUiStore } from "../../stores/mapUiStore";
import type { MapEntity, SpawnPointType } from "../../lib/schemas";
import { SpawnPointTypeSchema } from "../../lib/schemas";
import {
  SPAWN_POINT_TYPE_BADGE_TONE,
  SPAWN_POINT_TYPE_LABEL,
} from "../../lib/spawnPointMeta";
import { Panel } from "../ui/Panel";
import { Badge } from "../ui/Badge";

export function AdminEditPanel({
  map,
  token,
}: {
  map: MapEntity;
  token: string;
}) {
  const pendingAdminPoint = useMapUiStore((state) => state.pendingAdminPoint);
  const clearPendingAdminPoint = useMapUiStore(
    (state) => state.clearPendingAdminPoint,
  );
  const { data: spawnPoints } = useAdminSpawnPoints(map.id, token);
  const createMutation = useCreateSpawnPoint(token);
  const updateMutation = useUpdateSpawnPoint(token);
  const deleteMutation = useDeleteSpawnPoint(token);

  const [type, setType] = useState<SpawnPointType>("VEHICLE_FIXED");
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");

  function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!pendingAdminPoint || !label.trim()) return;
    createMutation.mutate(
      {
        mapId: map.id,
        type,
        x: pendingAdminPoint.x,
        y: pendingAdminPoint.y,
        label: label.trim(),
        description: description.trim() || undefined,
        sourceUrl: sourceUrl.trim() || undefined,
      },
      {
        onSuccess: () => {
          setLabel("");
          setDescription("");
          setSourceUrl("");
          clearPendingAdminPoint();
        },
      },
    );
  }

  return (
    <Panel className="mt-4 p-4">
      <h2 className="font-wordmark text-sm text-sub">관리자 편집</h2>
      <p className="mt-1 text-xs text-sub">
        지도를 클릭해 새 좌표를 지정하세요.
      </p>

      {pendingAdminPoint && (
        <form
          onSubmit={handleCreate}
          className="mt-3 space-y-2 border-t border-border pt-3"
        >
          <p className="font-tabular text-xs text-sub">
            선택 좌표: x {pendingAdminPoint.x.toFixed(0)}, y{" "}
            {pendingAdminPoint.y.toFixed(0)}
          </p>
          <select
            value={type}
            onChange={(e) =>
              setType(SpawnPointTypeSchema.parse(e.target.value))
            }
            className="clip-corner-sm w-full border border-border bg-panel-2 px-2 py-1.5 text-sm text-ink"
          >
            {SpawnPointTypeSchema.options.map((option) => (
              <option key={option} value={option}>
                {SPAWN_POINT_TYPE_LABEL[option]}
              </option>
            ))}
          </select>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="라벨 (예: 마을 남쪽 트럭)"
            required
            className="clip-corner-sm w-full border border-border bg-panel-2 px-2 py-1.5 text-sm text-ink"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="설명 (선택)"
            rows={2}
            className="clip-corner-sm w-full border border-border bg-panel-2 px-2 py-1.5 text-sm text-ink"
          />
          <input
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="출처 URL (선택)"
            className="clip-corner-sm w-full border border-border bg-panel-2 px-2 py-1.5 text-sm text-ink"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="font-wordmark clip-corner-sm flex-1 border border-accent bg-accent/15 py-1.5 text-sm text-accent disabled:opacity-50"
            >
              추가
            </button>
            <button
              type="button"
              onClick={clearPendingAdminPoint}
              className="clip-corner-sm border border-border px-3 py-1.5 text-sm text-sub"
            >
              취소
            </button>
          </div>
        </form>
      )}

      <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto border-t border-border pt-3">
        {spawnPoints?.map((sp) => (
          <li
            key={sp.id}
            className="flex items-center justify-between gap-2 text-sm"
          >
            <div className="min-w-0">
              <Badge
                tone={SPAWN_POINT_TYPE_BADGE_TONE[sp.type]}
                className="mb-1"
              >
                {SPAWN_POINT_TYPE_LABEL[sp.type]}
              </Badge>
              <p
                className={`truncate ${sp.isActive ? "text-ink" : "text-sub line-through"}`}
              >
                {sp.label}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <label className="flex items-center gap-1 text-xs text-sub">
                <input
                  type="checkbox"
                  checked={sp.isActive}
                  onChange={() =>
                    updateMutation.mutate({
                      id: sp.id,
                      patch: { isActive: !sp.isActive },
                    })
                  }
                  className="accent-accent h-3.5 w-3.5"
                />
                활성
              </label>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(sp.id)}
                className="text-marker-secret hover:opacity-75"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </li>
        ))}
        {spawnPoints?.length === 0 && (
          <li className="text-xs text-sub">등록된 스폰 포인트가 없습니다.</li>
        )}
      </ul>
    </Panel>
  );
}
