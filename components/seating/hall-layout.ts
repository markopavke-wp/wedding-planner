/**
 * Fiksni elementi sale (bina i noseći stubovi) prema planu iz sale.
 * Nisu stolovi, pa se ne čuvaju u bazi niti se pomeraju — služe kao orijentir
 * pri raspoređivanju. Koordinate su u istom sistemu kao stolovi (40px = 1m).
 */
export type HallElement = {
  id: string;
  kind: "stage" | "column";
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
};

const COLUMN_SIZE = 26;

function column(id: string, x: number, y: number): HallElement {
  return { id, kind: "column", x, y, width: COLUMN_SIZE, height: COLUMN_SIZE };
}

export const HALL_ELEMENTS: readonly HallElement[] = [
  {
    id: "hall-stage",
    kind: "stage",
    x: 760,
    y: -46,
    width: 340,
    height: 68,
    label: "BINA / STAGE",
  },

  // Stubovi uz gornji zid, oko bine
  column("hall-column-top-1", 430, -40),
  column("hall-column-top-2", 700, -40),
  column("hall-column-top-3", 1140, -40),
  column("hall-column-top-4", 1420, -40),

  // Stubovi u sredini sale, između okruglog i donjeg reda stolova
  column("hall-column-mid-1", 312, 782),
  column("hall-column-mid-2", 502, 782),
  column("hall-column-mid-3", 692, 782),
  column("hall-column-mid-4", 962, 782),

  // Stub uz desni zid, ispod glavnog stola
  { id: "hall-column-right", kind: "column", x: 1614, y: 626, width: 42, height: 42 },
];
