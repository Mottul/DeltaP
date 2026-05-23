import type { CalcResult, SectionResult } from "../engine/types";
import { formatPressure, mToMm, type PressureUnit } from "../engine/units";

const regimeLabel: Record<SectionResult["regime"], string> = {
  laminar: "laminar",
  transitional: "Übergang",
  turbulent: "turbulent",
};

function pUnitLabel(u: PressureUnit): string {
  return u === "pa" ? "Pa" : u === "kpa" ? "kPa" : "bar";
}

function fmtP(pa: number, u: PressureUnit): string {
  const v = formatPressure(pa, u);
  return `${v.toLocaleString("de-DE", { maximumFractionDigits: u === "pa" ? 1 : 4 })} ${pUnitLabel(u)}`;
}

export function ResultsView({
  result,
  pressureUnit,
}: {
  result: CalcResult;
  pressureUnit: PressureUnit;
}) {
  return (
    <section className="rounded-lg bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold">Ergebnis & Rechenweg</h2>

      <div className="space-y-4">
        {result.sections.map((r, i) => (
          <div key={r.id} className="rounded border border-slate-200 p-3 text-sm">
            <div className="mb-1 font-medium text-slate-700">
              #{i + 1} · {r.type === "straight" ? "Gerade Strecke" : "Kurve"}
            </div>
            <ul className="space-y-0.5 font-mono text-xs text-slate-700">
              <li>
                A = π/4·d² = {(r.area * 1e6).toFixed(1)} mm² (d = {mToMm(2 * Math.sqrt(r.area / Math.PI)).toFixed(1)} mm)
              </li>
              <li>v = Q/A = {r.velocity.toFixed(3)} m/s</li>
              <li>
                Re = v·d/ν = {r.reynolds.toLocaleString("de-DE", { maximumFractionDigits: 0 })} ({regimeLabel[r.regime]})
              </li>
              {r.type === "straight" ? (
                <>
                  <li>λ = {r.lambda!.toFixed(5)}</li>
                  <li>Δp = λ·(l/d)·(ρ/2)·v² = {fmtP(r.pressureDrop, pressureUnit)}</li>
                </>
              ) : (
                <>
                  <li>ζ = {r.zeta!.toFixed(3)}</li>
                  <li>Δp = ζ·(ρ/2)·v² = {fmtP(r.pressureDrop, pressureUnit)}</li>
                </>
              )}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded bg-sky-50 p-3">
        <div className="text-sm text-slate-600">Gesamter Druckverlust</div>
        <div className="text-2xl font-bold text-sky-800">
          Δp = {fmtP(result.totalPressureDrop, pressureUnit)}
        </div>
        <div className="mt-1 text-sm text-slate-600">
          Erforderliche Förderhöhe H = Δp/(ρ·g) ={" "}
          <span className="font-semibold">{result.head.toFixed(2)} m</span>
        </div>
      </div>
    </section>
  );
}
