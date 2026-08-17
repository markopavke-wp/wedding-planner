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
import { Maximize2, Minimize2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import "@xyflow/react/dist/style.css";

import { cn } from "@/lib/utils";
import type { SeatingTable } from "@/types/database";

import type { SeatingAnalytics } from "./analytics";
import type { Point } from "./geometry";
import { TableNode, type TableFlowNode } from "./table-node";

const nodeTypes: NodeTypes = { table: TableNode };

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

  const nodes = useMemo<TableFlowNode[]>(
    () =>
      tables.map((table) => {
        const occupancy = analytics.byTableId.get(table.id);

        return {
          id: table.id,
          type: "table",
          position: {
            x: Number(table.position_x),
            y: Number(table.position_y),
          },
          selected: table.id === selectedTableId,
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
      }),
    [tables, analytics, selectedTableId],
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange<TableFlowNode>[]) => {
      for (const change of changes) {
        if (change.type !== "position" || change.position === undefined) {
          continue;
        }
        onTableMove(change.id, change.position, change.dragging === true);
      }
    },
    [onTableMove],
  );

  const isExpanded = expanded;
  const fitSignature = useMemo(
    () => `${tables.map((table) => table.id).join(",")}|${isExpanded}`,
    [tables, isExpanded],
  );

  return (
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
        onNodeClick={(_event, node) => onSelectTable(node.id)}
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
  );
}
