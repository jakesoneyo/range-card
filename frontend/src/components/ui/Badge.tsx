/** 워드마크 계열 소형 배지 — 상태/타입 라벨용. skewX는 배지류에 한정 적용. */
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

const TONE_CLASSES = {
  accent: "border-accent/60 bg-accent/15 text-accent",
  vehicle: "border-marker-vehicle/60 bg-marker-vehicle/15 text-marker-vehicle",
  boat: "border-marker-boat/60 bg-marker-boat/15 text-marker-boat",
  secret: "border-marker-secret/60 bg-marker-secret/15 text-marker-secret",
  garage: "border-marker-garage/60 bg-marker-garage/15 text-marker-garage",
  glider: "border-marker-glider/60 bg-marker-glider/15 text-marker-glider",
  gasStation:
    "border-marker-gas-station/60 bg-marker-gas-station/15 text-marker-gas-station",
  sub: "border-border bg-panel-2 text-sub",
} as const;

export function Badge({
  children,
  tone = "sub",
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof TONE_CLASSES;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "clip-corner-sm font-wordmark inline-flex items-center border px-2 py-0.5 text-xs",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
