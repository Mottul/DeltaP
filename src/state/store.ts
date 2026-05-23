import { create } from "zustand";
import type { BendSection, FluidState, Section, StraightSection } from "../engine/types";
import type { FlowUnit, PressureUnit } from "../engine/units";

let counter = 0;
const nextId = (): string => `s${++counter}`;

export function makeStraight(): StraightSection {
  return {
    id: nextId(),
    type: "straight",
    length: 10,
    diameter: 0.05,
    roughness: 0.00005,
  };
}

export function makeBend(): BendSection {
  return {
    id: nextId(),
    type: "bend",
    angle: 90,
    diameter: 0.05,
    radiusRatio: 2,
  };
}

interface AppState {
  projectName: string;
  fluid: FluidState;
  flowValue: number;
  flowUnit: FlowUnit;
  pressureUnit: PressureUnit;
  sections: Section[];

  setProjectName: (v: string) => void;
  setFluid: (patch: Partial<FluidState>) => void;
  setFlowValue: (v: number) => void;
  setFlowUnit: (u: FlowUnit) => void;
  setPressureUnit: (u: PressureUnit) => void;

  addSection: (type: "straight" | "bend") => void;
  updateSection: (id: string, patch: Partial<Section>) => void;
  removeSection: (id: string) => void;
  moveSection: (id: string, dir: -1 | 1) => void;
}

export const useStore = create<AppState>((set) => ({
  projectName: "Neue Berechnung",
  fluid: { id: "water", temperatureC: 20 },
  flowValue: 10,
  flowUnit: "m3h",
  pressureUnit: "bar",
  sections: [makeStraight()],

  setProjectName: (v) => set({ projectName: v }),
  setFluid: (patch) => set((s) => ({ fluid: { ...s.fluid, ...patch } })),
  setFlowValue: (v) => set({ flowValue: v }),
  setFlowUnit: (u) => set({ flowUnit: u }),
  setPressureUnit: (u) => set({ pressureUnit: u }),

  addSection: (type) =>
    set((s) => ({
      sections: [...s.sections, type === "straight" ? makeStraight() : makeBend()],
    })),

  updateSection: (id, patch) =>
    set((s) => ({
      sections: s.sections.map((sec) =>
        sec.id === id ? ({ ...sec, ...patch } as Section) : sec,
      ),
    })),

  removeSection: (id) =>
    set((s) => ({ sections: s.sections.filter((sec) => sec.id !== id) })),

  moveSection: (id, dir) =>
    set((s) => {
      const idx = s.sections.findIndex((sec) => sec.id === id);
      const target = idx + dir;
      if (idx < 0 || target < 0 || target >= s.sections.length) return s;
      const next = [...s.sections];
      [next[idx], next[target]] = [next[target], next[idx]];
      return { sections: next };
    }),
}));
