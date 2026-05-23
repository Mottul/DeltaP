import type { FluidProperties, FluidState } from "./types";

interface WaterRow {
  t: number; // °C
  rho: number; // kg/m³
  nu: number; // m²/s
}

// Stoffwerte Wasser bei 1 bar (Standardtabellen). ν in m²/s.
const WATER_TABLE: WaterRow[] = [
  { t: 0, rho: 999.84, nu: 1.792e-6 },
  { t: 10, rho: 999.7, nu: 1.307e-6 },
  { t: 20, rho: 998.21, nu: 1.004e-6 },
  { t: 30, rho: 995.65, nu: 0.801e-6 },
  { t: 40, rho: 992.22, nu: 0.658e-6 },
  { t: 50, rho: 988.04, nu: 0.553e-6 },
  { t: 60, rho: 983.2, nu: 0.475e-6 },
  { t: 70, rho: 977.76, nu: 0.413e-6 },
  { t: 80, rho: 971.79, nu: 0.365e-6 },
  { t: 90, rho: 965.31, nu: 0.326e-6 },
  { t: 100, rho: 958.35, nu: 0.294e-6 },
];

function interpolate(t: number, key: "rho" | "nu"): number {
  const table = WATER_TABLE;
  const tClamped = Math.min(Math.max(t, table[0].t), table[table.length - 1].t);
  for (let i = 0; i < table.length - 1; i++) {
    const a = table[i];
    const b = table[i + 1];
    if (tClamped >= a.t && tClamped <= b.t) {
      const f = (tClamped - a.t) / (b.t - a.t);
      return a[key] + f * (b[key] - a[key]);
    }
  }
  return table[table.length - 1][key];
}

export function waterProperties(temperatureC: number): FluidProperties {
  return {
    label: `Wasser bei ${temperatureC} °C`,
    density: interpolate(temperatureC, "rho"),
    kinematicViscosity: interpolate(temperatureC, "nu"),
  };
}

/** Stoffwerte für den aktuellen Fluid-Zustand auflösen (SI). */
export function resolveFluid(state: FluidState): FluidProperties {
  if (state.id === "water") {
    return waterProperties(state.temperatureC);
  }
  return {
    label: "Eigene Flüssigkeit",
    density: state.customDensity ?? 1000,
    kinematicViscosity: state.customKinematicViscosity ?? 1e-6,
  };
}

/** Übliche Rohrrauheiten ε in m für die Materialauswahl. */
export const ROUGHNESS_PRESETS: { label: string; value: number }[] = [
  { label: "Kunststoff (PVC/PE), glatt", value: 0.0000015 },
  { label: "Kupfer, gezogen", value: 0.0000015 },
  { label: "Stahl, neu nahtlos", value: 0.00005 },
  { label: "Stahl, verzinkt", value: 0.00015 },
  { label: "Stahl, leicht angerostet", value: 0.0005 },
  { label: "Guss", value: 0.001 },
];
