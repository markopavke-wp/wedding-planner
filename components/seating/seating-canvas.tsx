"use client";

import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  useReactFlow,
  type NodeChange,
  type NodeTypes,
} from "@xyflow/react";
import { Eye, EyeOff, Maximize2, Minimize2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import "@xyflow/react/dist/style.css";

import { cn } from "@/lib/utils";
import type { SeatingTable } from "@/types/database";

import type { SeatingAnalytics } from "./analytics";
import type { Point } from "./geometry";
import { HALL_ELEMENTS } from "./hall-layout";
import { HallNode, type HallFlowNode } from "./hall-node";
import { TableNode, type TableFlowNode } from "./table-node";
import {
  TABLE_SIDE_LABELS,
  TABLE_SIDE_SWATCH_CLASSES,
  TABLE_SIDES,
} from "./types";

type SeatingFlowNode = TableFlowNode | HallFlowNode;

const nodeTypes: NodeTypes = { table: TableNode, hall: HallNode };

/** Bina i stubovi su fiksni, pa se čvorovi prave jednom. */
const hallNodes: HallFlowNode[] = HALL_ELEMENTS.map((element) => ({
  id: element.id,
  type: "hall",
  position: { x: element.x, y: element.y },
  data: { element },
  draggable: false,
  selectable: false,
  focusable: false,
  deletable: false,
  zIndex: 0,
}));

/**
 * `fitView` se primenjuje samo pri montiranju, pa plan ostane van vidnog polja
 * kad se skup stolova ili visina platna promene. Ovde ga ponovo pokrećemo.
 */
function FitViewOnChange({ signature }: { signature: string }) {
  const { fitView } = useReactFlow();

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      void fitView({ padding: 0.12, duration: 250 });
    });
    return () => cancelAnimationFrame(frame);
  }, [signature, fitView]);

  return null;
}

export interface SeatingCanvasProps {
  tables: readonly SeatingTable[];
  analytics: SeatingAnalytics;
  selectedTableId: string | null;
  onSelectTable: (tableId: string | null) => void;
  /** `isDragging` je tačno dok se sto još pomera, pa upis u bazu radimo tek na kraju. */
  onTableMove: (tableId: string, position: Point, isDragging: boolean) => void;
}

export function SeatingCanvas({
  tables,
  analytics,
  selectedTableId,
  onSelectTable,
  onTableMove,
}: SeatingCanvasProps) {
  const [expanded, setExpanded] = useState(false);
  const [legendVisible, setLegendVisible] = useState(true);

  const tableIds = useMemo(
    () => new Set(tables.map((table) => table.id)),
    [tables],
  );

  const nodes = useMemo<SeatingFlowNode[]>(() => {
    const tableNodes: TableFlowNode[] = tables.map((table) => {
      const occupancy = analytics.byTableId.get(table.id);

      return {
        id: table.id,
        type: "table",
        position: {
          x: Number(table.position_x),
          y: Number(table.position_y),
        },
        selected: table.id === selectedTableId,
        zIndex: 1,
        data: {
          table,
          guests: occupancy?.guests ?? [],
          occupied: occupancy?.occupied ?? 0,
          freeSeats: occupancy?.freeSeats ?? table.capacity,
          occupancyPercent: occupancy?.occupancyPercent ?? 0,
          isOverCapacity: occupancy?.isOverCapacity ?? false,
          isFull: occupancy?.isFull ?? false,
        },
      };
    });

    return [...hallNodes, ...tableNodes];
  }, [tables, analytics, selectedTableId]);

  const handleNodesChange = useCallback(
    (changes: NodeChange<SeatingFlowNode>[]) => {
      for (const change of changes) {
        if (change.type !== "position" || change.position === undefined) {
          continue;
        }
        // Bina i stubovi se ne pomeraju niti čuvaju.
        if (!tableIds.has(change.id)) continue;
        onTableMove(change.id, change.position, change.dragging === true);
      }
    },
    [onTableMove, tableIds],
  );

  const isExpanded = expanded;
  const fitSignature = useMemo(
    () => `${tables.map((table) => table.id).join(",")}|${isExpanded}`,
    [tables, isExpanded],
  );

  return (
    <div className="flex flex-col gap-2">
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-2xl border border-border bg-background",
          // `dvh` prati adresnu traku mobilnih browsera; minimum držimo nisko da
          // panel sa gostima ostane dohvatljiv na malim ekranima.
          isExpanded
            ? "h-[calc(100dvh-9rem)]"
            : "h-[52dvh] min-h-[320px] sm:h-[60dvh] sm:min-h-[440px] xl:h-[68dvh] xl:min-h-[560px]",
        )}
      >
        <ReactFlow
          nodes={nodes}
          nodeTypes={nodeTypes}
          onNodesChange={handleNodesChange}
          onNodeClick={(_event, node) => {
            if (node.type === "hall") return;
            onSelectTable(node.id);
          }}
          onPaneClick={() => onSelectTable(null)}
          nodesConnectable={false}
          elementsSelectable
          deleteKeyCode={null}
          minZoom={0.1}
          maxZoom={2}
          fitView
          fitViewOptions={{ padding: 0.12 }}
          proOptions={{ hideAttribution: true }}
        >
          <FitViewOnChange signature={fitSignature} />
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} />
          <Controls showInteractive={false} />
        </ReactFlow>

        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          aria-label={isExpanded ? "Smanji plan sale" : "Uvećaj plan sale"}
          title={isExpanded ? "Smanji plan sale" : "Uvećaj plan sale"}
          className="absolute right-3 top-3 z-10 flex size-11 items-center justify-center rounded-full border border-border bg-card text-muted shadow-soft transition hover:text-foreground"
        >
          {isExpanded ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </button>

        {tables.length === 0 ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6 text-center">
            <p className="max-w-sm text-sm text-muted">
              Plan sale je prazan. Dodajte prvi sto da biste počeli sa
              raspoređivanjem gostiju.
            </p>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
        <button
          type="button"
          onClick={() => setLegendVisible((current) => !current)}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-muted transition hover:text-foreground"
        >
          {legendVisible ? (
            <EyeOff className="h-3.5 w-3.5" />
          ) : (
            <Eye className="h-3.5 w-3.5" />
          )}
          {legendVisible ? "Sakrij legendu" : "Prikaži legendu"}
        </button>

        {legendVisible ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {TABLE_SIDES.map((side) => (
              <span key={side} className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden
                  className={cn(
                    "size-2.5 rounded-full",
                    TABLE_SIDE_SWATCH_CLASSES[side],
                  )}
                />
                <span className="text-muted">{TABLE_SIDE_LABELS[side]}</span>
              </span>
            ))}
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden
                className="size-2.5 rounded-full border border-border bg-card"
              />
              <span className="text-muted">Bez strane</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="size-2.5 rounded-[2px] bg-foreground/80" />
              <span className="text-muted">Stub sale</span>
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
