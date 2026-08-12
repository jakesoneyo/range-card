/** 박격포 사거리 계산 결과 카드 — 거리(tabular-nums)와 판정 배지. */
import type { MortarCalculationResult } from "../../lib/mortar";
import { Badge } from "../ui/Badge";

const STATUS_LABEL: Record<MortarCalculationResult["status"], string> = {
  "too-close": "사거리 미달",
  "in-range": "사거리 이내",
  "too-far": "사거리 초과",
};

export function MortarResultCard({
  result,
}: {
  result: MortarCalculationResult;
}) {
  const tone = result.status === "in-range" ? "accent" : "secret";

  return (
    <div className="mt-3 space-y-2">
      <p className="font-tabular text-2xl text-ink">
        {result.distanceM.toFixed(0)}
        <span className="ml-1 text-sm text-sub">m</span>
      </p>
      <Badge tone={tone}>{STATUS_LABEL[result.status]}</Badge>
      {result.warning && <p className="text-xs text-sub">{result.warning}</p>}
    </div>
  );
}
