import { bendZeta } from "./fittings";
import { flowRegime, frictionFactor } from "./friction";
import type {
  CalcResult,
  FluidProperties,
  Section,
  SectionResult,
} from "./types";
import { GRAVITY } from "./units";

/** Druckverlust und Zwischengrößen eines einzelnen Abschnitts berechnen. */
export function calcSection(
  section: Section,
  flow: number,
  fluid: FluidProperties,
): SectionResult {
  const { density: rho, kinematicViscosity: nu } = fluid;
  const d = section.diameter;
  const area = (Math.PI / 4) * d * d;
  const velocity = area > 0 ? flow / area : 0;
  const reynolds = nu > 0 ? (velocity * d) / nu : 0;
  const regime = flowRegime(reynolds);
  const dynamicHead = (rho / 2) * velocity * velocity;

  if (section.type === "straight") {
    const lambda = frictionFactor(reynolds, d, section.roughness);
    const pressureDrop = (lambda * section.length * dynamicHead) / d;
    return {
      id: section.id,
      type: "straight",
      area,
      velocity,
      reynolds,
      regime,
      lambda,
      pressureDrop,
    };
  }

  const zeta =
    section.manualZeta != null
      ? section.manualZeta
      : bendZeta(section.angle, section.radiusRatio);
  const pressureDrop = zeta * dynamicHead;
  return {
    id: section.id,
    type: "bend",
    area,
    velocity,
    reynolds,
    regime,
    zeta,
    pressureDrop,
  };
}

/** Gesamtberechnung über alle Abschnitte. */
export function calcTotal(
  sections: Section[],
  flow: number,
  fluid: FluidProperties,
): CalcResult {
  const results = sections.map((s) => calcSection(s, flow, fluid));
  const totalPressureDrop = results.reduce((sum, r) => sum + r.pressureDrop, 0);
  const head = totalPressureDrop / (fluid.density * GRAVITY);
  return {
    fluid,
    flow,
    sections: results,
    totalPressureDrop,
    head,
  };
}
