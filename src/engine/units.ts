export const GRAVITY = 9.80665; // m/s²

export type FlowUnit = "m3h" | "lmin" | "ls";

/** Volumenstrom in SI (m³/s) umrechnen */
export function flowToSI(value: number, unit: FlowUnit): number {
  switch (unit) {
    case "m3h":
      return value / 3600;
    case "lmin":
      return value / 60000;
    case "ls":
      return value / 1000;
  }
}

export function flowFromSI(valueSI: number, unit: FlowUnit): number {
  switch (unit) {
    case "m3h":
      return valueSI * 3600;
    case "lmin":
      return valueSI * 60000;
    case "ls":
      return valueSI * 1000;
  }
}

export const mmToM = (mm: number): number => mm / 1000;
export const mToMm = (m: number): number => m * 1000;

export type PressureUnit = "pa" | "kpa" | "bar";

export function formatPressure(pa: number, unit: PressureUnit): number {
  switch (unit) {
    case "pa":
      return pa;
    case "kpa":
      return pa / 1000;
    case "bar":
      return pa / 100000;
  }
}
