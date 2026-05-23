import { pdf } from "@react-pdf/renderer";
import { useMemo, useState } from "react";
import { FluidPanel } from "./components/FluidPanel";
import { ResultsView } from "./components/ResultsView";
import { SectionEditor } from "./components/SectionEditor";
import { calcTotal } from "./engine/calc";
import { resolveFluid } from "./engine/fluids";
import { flowToSI } from "./engine/units";
import { Report } from "./pdf/Report";
import { useStore } from "./state/store";

const flowUnitLabel: Record<string, string> = { m3h: "m³/h", lmin: "l/min", ls: "l/s" };

export default function App() {
  const state = useStore();
  const [exporting, setExporting] = useState(false);

  const fluidProps = useMemo(() => resolveFluid(state.fluid), [state.fluid]);
  const flowSI = useMemo(
    () => flowToSI(state.flowValue, state.flowUnit),
    [state.flowValue, state.flowUnit],
  );
  const result = useMemo(
    () => calcTotal(state.sections, flowSI, fluidProps),
    [state.sections, flowSI, fluidProps],
  );

  const valid = state.sections.length > 0 && state.flowValue > 0;

  async function exportPdf() {
    setExporting(true);
    try {
      const blob = await pdf(
        <Report
          projectName={state.projectName}
          result={result}
          pressureUnit={state.pressureUnit}
          date={new Date().toLocaleDateString("de-DE")}
          flowLabel={`${state.flowValue} ${flowUnitLabel[state.flowUnit]}`}
        />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${state.projectName || "DeltaP"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-6">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">DeltaP</h1>
          <p className="text-sm text-slate-500">
            Pumpen-Auslegung über den Druckabfall in der Leitung
          </p>
        </div>
        <button
          className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-40"
          disabled={!valid || exporting}
          onClick={exportPdf}
        >
          {exporting ? "Erzeuge PDF…" : "Als PDF exportieren"}
        </button>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <FluidPanel />
          <SectionEditor />
        </div>
        <div>
          {valid ? (
            <ResultsView result={result} pressureUnit={state.pressureUnit} />
          ) : (
            <section className="rounded-lg bg-white p-4 text-sm text-slate-500 shadow-sm">
              Bitte einen Volumenstrom &gt; 0 und mindestens einen Abschnitt angeben.
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
