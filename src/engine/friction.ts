import type { FlowRegime } from "./types";

export const RE_LAMINAR_MAX = 2300;
export const RE_TURBULENT_MIN = 4000;

export function flowRegime(re: number): FlowRegime {
  if (re <= RE_LAMINAR_MAX) return "laminar";
  if (re >= RE_TURBULENT_MIN) return "turbulent";
  return "transitional";
}

/** Laminare Rohrreibungszahl nach Hagen-Poiseuille. */
export function lambdaLaminar(re: number): number {
  return 64 / re;
}

/**
 * Turbulente Rohrreibungszahl nach Colebrook-White, iterativ gelöst.
 * 1/√λ = -2·log10( ε/(3.7·d) + 2.51/(Re·√λ) )
 */
export function lambdaColebrook(re: number, diameter: number, roughness: number): number {
  const relRoughness = roughness / diameter;
  // Startwert nach Swamee-Jain (explizite Näherung)
  let lambda =
    0.25 / Math.pow(Math.log10(relRoughness / 3.7 + 5.74 / Math.pow(re, 0.9)), 2);

  for (let i = 0; i < 50; i++) {
    const rhs = -2 * Math.log10(relRoughness / 3.7 + 2.51 / (re * Math.sqrt(lambda)));
    const next = 1 / (rhs * rhs);
    if (Math.abs(next - lambda) < 1e-10) {
      return next;
    }
    lambda = next;
  }
  return lambda;
}

/**
 * Rohrreibungszahl λ für beliebiges Re.
 * Im Übergangsbereich (2300–4000) wird zwischen laminarem und turbulentem Wert interpoliert.
 */
export function frictionFactor(re: number, diameter: number, roughness: number): number {
  if (re <= 0) return 0;
  if (re <= RE_LAMINAR_MAX) {
    return lambdaLaminar(re);
  }
  if (re >= RE_TURBULENT_MIN) {
    return lambdaColebrook(re, diameter, roughness);
  }
  const lamLow = lambdaLaminar(RE_LAMINAR_MAX);
  const lamHigh = lambdaColebrook(RE_TURBULENT_MIN, diameter, roughness);
  const f = (re - RE_LAMINAR_MAX) / (RE_TURBULENT_MIN - RE_LAMINAR_MAX);
  return lamLow + f * (lamHigh - lamLow);
}
