import type { SeatingTable, TableShape } from "@/types/database";

/** Plan sale je shematski: 40px na platnu tretiramo kao 1 metar u sali. */
export const PIXELS_PER_METER = 40;

export interface TableSize {
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export const DEFAULT_TABLE_SIZES: Record<TableShape, TableSize> = {
  round: { width: 168, height: 168 },
  rectangular: { width: 208, height: 136 },
  head_table: { width: 288, height: 120 },
};

/** Kolone u `tables` dopuštaju ručno zadatu veličinu; inače koristimo podrazumevanu za oblik. */
export function getTableSize(table: SeatingTable): TableSize {
  const fallback = DEFAULT_TABLE_SIZES[table.shape];
  return {
    width: table.width ?? fallback.width,
    height: table.height ?? fallback.height,
  };
}

export function getTablePosition(table: SeatingTable): Point {
  return { x: Number(table.position_x), y: Number(table.position_y) };
}

export function getTableCenter(table: SeatingTable): Point {
  const size = getTableSize(table);
  const position = getTablePosition(table);
  return {
    x: position.x + size.width / 2,
    y: position.y + size.height / 2,
  };
}

export function euclideanDistance(from: Point, to: Point): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function distanceBetweenTables(
  from: SeatingTable,
  to: SeatingTable,
): number {
  return euclideanDistance(getTableCenter(from), getTableCenter(to));
}

export function pixelsToMeters(pixels: number): number {
  return pixels / PIXELS_PER_METER;
}

const metersFormatter = new Intl.NumberFormat("sr-RS", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function formatMeters(meters: number): string {
  return `${metersFormatter.format(meters)} m`;
}

export function formatMetersFromPixels(pixels: number): string {
  return formatMeters(pixelsToMeters(pixels));
}

const GRID_STEP_X = 260;
const GRID_STEP_Y = 240;
const GRID_COLUMNS = 4;
const GRID_ORIGIN: Point = { x: 80, y: 260 };
const HEAD_TABLE_ORIGIN: Point = { x: 80, y: 40 };

/**
 * Deterministički pronalazi prvo slobodno mesto u mreži kako novi stolovi ne bi
 * bili dodati jedan preko drugog.
 */
export function nextTablePosition(
  tables: readonly SeatingTable[],
  shape: TableShape,
): Point {
  if (shape === "head_table") {
    return HEAD_TABLE_ORIGIN;
  }

  const taken = new Set(
    tables.map((table) => {
      const position = getTablePosition(table);
      return `${Math.round(position.x)}:${Math.round(position.y)}`;
    }),
  );

  for (let index = 0; index < GRID_COLUMNS * 50; index += 1) {
    const candidate: Point = {
      x: GRID_ORIGIN.x + (index % GRID_COLUMNS) * GRID_STEP_X,
      y: GRID_ORIGIN.y + Math.floor(index / GRID_COLUMNS) * GRID_STEP_Y,
    };
    if (!taken.has(`${candidate.x}:${candidate.y}`)) {
      return candidate;
    }
  }

  return GRID_ORIGIN;
}
