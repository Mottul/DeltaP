// Widerstandsbeiwerte ζ für Rohrkrümmer (glatt), nach gängigen Standardtabellen
// (Idelchik / VDI-Wärmeatlas-Größenordnung). Werte werden zwischen den Stützstellen
// linear interpoliert.

interface Row {
  x: number;
  zeta: number;
}

// Basis-ζ für einen 90°-Krümmer in Abhängigkeit vom Radienverhältnis R/d.
const ZETA_90_BY_RATIO: Row[] = [
  { x: 0.5, zeta: 1.0 }, // sehr enger / scharfer Bogen
  { x: 1, zeta: 0.35 },
  { x: 2, zeta: 0.19 },
  { x: 4, zeta: 0.16 },
  { x: 6, zeta: 0.21 },
  { x: 10, zeta: 0.29 },
];

// Korrekturfaktor für den Umlenkwinkel, bezogen auf 90°.
const ANGLE_FACTOR: Row[] = [
  { x: 0, zeta: 0 },
  { x: 30, zeta: 0.5 },
  { x: 45, zeta: 0.7 },
  { x: 60, zeta: 0.85 },
  { x: 90, zeta: 1.0 },
  { x: 120, zeta: 1.2 },
  { x: 180, zeta: 1.4 },
];

function interp(table: Row[], x: number): number {
  const xc = Math.min(Math.max(x, table[0].x), table[table.length - 1].x);
  for (let i = 0; i < table.length - 1; i++) {
    const a = table[i];
    const b = table[i + 1];
    if (xc >= a.x && xc <= b.x) {
      const f = (xc - a.x) / (b.x - a.x);
      return a.zeta + f * (b.zeta - a.zeta);
    }
  }
  return table[table.length - 1].zeta;
}

/** Widerstandsbeiwert ζ eines Krümmers aus Umlenkwinkel und Radienverhältnis R/d. */
export function bendZeta(angle: number, radiusRatio: number): number {
  const zeta90 = interp(ZETA_90_BY_RATIO, radiusRatio);
  const factor = interp(ANGLE_FACTOR, angle);
  return zeta90 * factor;
}
