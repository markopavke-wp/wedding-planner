"use client";

import type { Node, NodeProps } from "@xyflow/react";
import { memo } from "react";

import { cn } from "@/lib/utils";

import type { HallElement } from "./hall-layout";

export type HallNodeData = { element: HallElement };
export type HallFlowNode = Node<HallNodeData, "hall">;

function HallNodeComponent({ data }: NodeProps<HallFlowNode>) {
  const { element } = data;
  const isStage = element.kind === "stage";

  return (
    <div
      style={{ width: element.width, height: element.height }}
      aria-label={isStage ? "Bina" : "Stub sale"}
      className={cn(
        "pointer-events-none flex items-center justify-center",
        isStage
          ? "rounded-xl border-2 border-dashed border-muted-foreground/50 bg-secondary/70"
          : "rounded-[3px] bg-foreground/80",
      )}
    >
      {isStage && element.label ? (
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          {element.label}
        </span>
      ) : null}
    </div>
  );
}

export const HallNode = memo(HallNodeComponent);
