import { resolveFluid } from "../engine/fluids";
import type { FlowUnit, PressureUnit } from "../engine/units";
import { useStore } from "../state/store";
import { NumberField } from "./Field";

export function FluidPanel() {
  const { projectName, fluid, flowValue, flowUnit, pressureUnit } = useStore();
  const setFluid = useStore((s) => s.setFluid);
  const setProjectName = useStore((s) => s.setProjectName);
  const setFlowValue = useStore((s) => s.setFlowValue);
  const setFlowUnit = useStore((s) => s.setFlowUnit);
  const setPressureUnit = useStore((s) => s.setPressureUnit);

  const props = resolveFluid(fluid);

  return (
    <section className="rounded-lg bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold">Flüssigkeit & Volumenstrom</h2>

      <label className="mb-3 flex flex-col gap-1 text-sm">
        <span className="text-slate-600">Projektname</span>
        <input
          className="rounded border border-slate-300 px-2 py-1 focus:border-sky-500 focus:outline-none"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-600">Flüssigkeit</span>
          <select
            className="rounded border border-slate-300 px-2 py-1"
            value={fluid.id}
            onChange={(e) => setFluid({ id: e.target.value as "water" | "custom" })}
          >
            <option value="water">Wasser</option>
            <option value="custom">Eigene Flüssigkeit</option>
          </select>
        </label>

        {fluid.id === "water" ? (
          <NumberField
            label="Temperatur"
            unit="°C"
            value={fluid.temperatureC}
            min={0}
            onChange={(v) => setFluid({ temperatureC: v })}
          />
        ) : (
          <NumberField
            label="Dichte ρ"
            unit="kg/m³"
            value={fluid.customDensity ?? 1000}
            onChange={(v) => setFluid({ customDensity: v })}
          />
        )}
      </div>

      {fluid.id === "custom" && (
        <div className="mt-3">
          <NumberField
            label="Kinematische Viskosität ν"
            unit="m²/s"
            value={fluid.customKinematicViscosity ?? 1e-6}
            onChange={(v) => setFluid({ customKinematicViscosity: v })}
          />
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-3">
        <NumberField
          label="Volumenstrom Q"
          value={flowValue}
          min={0}
          onChange={setFlowValue}
        />
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-600">Einheit</span>
          <select
            className="rounded border border-slate-300 px-2 py-1"
            value={flowUnit}
            onChange={(e) => setFlowUnit(e.target.value as FlowUnit)}
          >
            <option value="m3h">m³/h</option>
            <option value="lmin">l/min</option>
            <option value="ls">l/s</option>
          </select>
        </label>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-600">Druck-Ausgabeeinheit</span>
          <select
            className="rounded border border-slate-300 px-2 py-1"
            value={pressureUnit}
            onChange={(e) => setPressureUnit(e.target.value as PressureUnit)}
          >
            <option value="bar">bar</option>
            <option value="kpa">kPa</option>
            <option value="pa">Pa</option>
          </select>
        </label>
      </div>

      <div className="mt-3 rounded bg-slate-50 p-2 text-xs text-slate-600">
        Stoffwerte: ρ = {props.density.toFixed(2)} kg/m³, ν ={" "}
        {props.kinematicViscosity.toExponential(3)} m²/s
      </div>
    </section>
  );
}
