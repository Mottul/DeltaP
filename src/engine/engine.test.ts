import { describe, expect, it } from "vitest";
import { calcSection, calcTotal } from "./calc";
import { resolveFluid, waterProperties } from "./fluids";
import { frictionFactor, lambdaColebrook, lambdaLaminar } from "./friction";
import { bendZeta } from "./fittings";
import type { StraightSection, BendSection } from "./types";
import { flowToSI } from "./units";

describe("friction factor", () => {
  it("laminar: λ = 64/Re", () => {
    expect(lambdaLaminar(1000)).toBeCloseTo(0.064, 6);
    expect(frictionFactor(2000, 0.05, 0.00005)).toBeCloseTo(64 / 2000, 6);
  });

  it("Colebrook-White satisfies its own implicit equation", () => {
    const re = 1e5;
    const d = 0.1;
    const eps = 0.0001;
    const lambda = lambdaColebrook(re, d, eps);
    const lhs = 1 / Math.sqrt(lambda);
    const rhs = -2 * Math.log10(eps / (3.7 * d) + 2.51 / (re * Math.sqrt(lambda)));
    expect(lhs).toBeCloseTo(rhs, 6);
  });

  it("Colebrook-White matches Moody chart order of magnitude", () => {
    // Re = 1e5, ε/d = 0.001 → λ ≈ 0.0224 (Moody)
    const lambda = lambdaColebrook(1e5, 0.1, 0.0001);
    expect(lambda).toBeGreaterThan(0.021);
    expect(lambda).toBeLessThan(0.024);
  });
});

describe("water properties", () => {
  it("returns known density at 20 °C", () => {
    const p = waterProperties(20);
    expect(p.density).toBeCloseTo(998.21, 2);
    expect(p.kinematicViscosity).toBeCloseTo(1.004e-6, 9);
  });

  it("interpolates between table rows", () => {
    const p = waterProperties(25);
    expect(p.density).toBeGreaterThan(995.65);
    expect(p.density).toBeLessThan(998.21);
  });
});

describe("velocity and Reynolds", () => {
  it("computes v = Q/A and Re = v·d/ν", () => {
    const fluid = waterProperties(20);
    const flow = flowToSI(10, "m3h"); // 10 m³/h
    const section: StraightSection = {
      id: "1",
      type: "straight",
      length: 10,
      diameter: 0.05,
      roughness: 0.00005,
    };
    const r = calcSection(section, flow, fluid);
    const area = (Math.PI / 4) * 0.05 * 0.05;
    const v = flow / area;
    expect(r.velocity).toBeCloseTo(v, 9);
    expect(r.reynolds).toBeCloseTo((v * 0.05) / fluid.kinematicViscosity, 3);
  });
});

describe("straight section pressure drop", () => {
  it("matches hand calculation Δp = λ·(l/d)·(ρ/2)·v²", () => {
    const fluid = waterProperties(20);
    const flow = flowToSI(20, "m3h");
    const section: StraightSection = {
      id: "1",
      type: "straight",
      length: 50,
      diameter: 0.05,
      roughness: 0.00005,
    };
    const r = calcSection(section, flow, fluid);
    const expected =
      (r.lambda! * section.length * (fluid.density / 2) * r.velocity ** 2) /
      section.diameter;
    expect(r.pressureDrop).toBeCloseTo(expected, 6);
    expect(r.pressureDrop).toBeGreaterThan(0);
  });
});

describe("bend section", () => {
  it("uses ζ and Δp = ζ·(ρ/2)·v²", () => {
    const fluid = waterProperties(20);
    const flow = flowToSI(20, "m3h");
    const section: BendSection = {
      id: "b",
      type: "bend",
      angle: 90,
      diameter: 0.05,
      radiusRatio: 2,
    };
    const r = calcSection(section, flow, fluid);
    expect(r.zeta).toBeCloseTo(bendZeta(90, 2), 6);
    const expected = r.zeta! * (fluid.density / 2) * r.velocity ** 2;
    expect(r.pressureDrop).toBeCloseTo(expected, 6);
  });

  it("respects a manual ζ override", () => {
    const fluid = waterProperties(20);
    const flow = flowToSI(20, "m3h");
    const section: BendSection = {
      id: "b",
      type: "bend",
      angle: 90,
      diameter: 0.05,
      radiusRatio: 2,
      manualZeta: 0.5,
    };
    const r = calcSection(section, flow, fluid);
    expect(r.zeta).toBe(0.5);
  });
});

describe("total", () => {
  it("sums section drops and derives head H = Δp/(ρ·g)", () => {
    const fluid = resolveFluid({ id: "water", temperatureC: 20 });
    const flow = flowToSI(20, "m3h");
    const sections: (StraightSection | BendSection)[] = [
      { id: "1", type: "straight", length: 50, diameter: 0.05, roughness: 0.00005 },
      { id: "2", type: "bend", angle: 90, diameter: 0.05, radiusRatio: 2 },
    ];
    const result = calcTotal(sections, flow, fluid);
    const sum = result.sections.reduce((s, r) => s + r.pressureDrop, 0);
    expect(result.totalPressureDrop).toBeCloseTo(sum, 6);
    expect(result.head).toBeCloseTo(
      result.totalPressureDrop / (fluid.density * 9.80665),
      6,
    );
  });
});
