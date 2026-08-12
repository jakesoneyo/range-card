/** 대각선 컷 코너 패널 — 카드/사이드바 등 Variant E 공용 컨테이너. */
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("clip-corner border border-border bg-panel", className)}>
      {children}
    </div>
  );
}
