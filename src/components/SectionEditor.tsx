import { ROUGHNESS_PRESETS } from "../engine/fluids";
import type { BendSection, StraightSection } from "../engine/types";
import { mToMm, mmToM } from "../engine/units";
import { useStore } from "../state/store";
import { NumberField } from "./Field";

function StraightRow({ section }: { section: StraightSection }) {
  const update = useStore((s) => s.updateSection);
  return (
    <div className="grid grid-cols-3 gap-3">
      <NumberField
        label="Länge l"
        unit="m"
        value={section.length}
        min={0}
        onChange={(v) => update(section.id, { length: v })}
      />
      <NumberField
        label="Durchmesser d"
        unit="mm"
        value={mToMm(section.diameter)}
        min={0}
        onChange={(v) => update(section.id, { diameter: mmToM(v) })}
      />
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-slate-600">Material / Rauheit ε</span>
        <select
          className="rounded border border-slate-300 px-2 py-1"
          value={section.roughness}
          onChange={(e) => update(section.id, { roughness: parseFloat(e.target.value) })}
        >
          {ROUGHNESS_PRESETS.map((p) => (
            <option key={p.label} value={p.value}>
              {p.label} ({(p.value * 1000).toFixed(3)} mm)
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function BendRow({ section }: { section: BendSection }) {
  const update = useStore((s) => s.updateSection);
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <NumberField
        label="Winkel"
        unit="°"
        value={section.angle}
        min={0}
        onChange={(v) => update(section.id, { angle: v })}
      />
      <NumberField
        label="Durchmesser d"
        unit="mm"
        value={mToMm(section.diameter)}
        min={0}
        onChange={(v) => update(section.id, { diameter: mmToM(v) })}
      />
      <NumberField
        label="Radienverhältnis R/d"
        value={section.radiusRatio}
        min={0}
        onChange={(v) => update(section.id, { radiusRatio: v })}
      />
      <NumberField
        label="ζ manuell (optional)"
        value={section.manualZeta ?? NaN}
        onChange={(v) =>
          update(section.id, { manualZeta: Number.isFinite(v) ? v : undefined })
        }
      />
    </div>
  );
}

export function SectionEditor() {
  const sections = useStore((s) => s.sections);
  const addSection = useStore((s) => s.addSection);
  const removeSection = useStore((s) => s.removeSection);
  const moveSection = useStore((s) => s.moveSection);

  return (
    <section className="rounded-lg bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Leitungsabschnitte</h2>
        <div className="flex gap-2">
          <button
            className="rounded bg-sky-600 px-3 py-1 text-sm text-white hover:bg-sky-700"
            onClick={() => addSection("straight")}
          >
            + Gerade
          </button>
          <button
            className="rounded bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-700"
            onClick={() => addSection("bend")}
          >
            + Kurve
          </button>
        </div>
      </div>

      {sections.length === 0 && (
        <p className="text-sm text-slate-500">
          Noch keine Abschnitte. Füge eine Gerade oder Kurve hinzu.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {sections.map((section, i) => (
          <div key={section.id} className="rounded border border-slate-200 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">
                #{i + 1} · {section.type === "straight" ? "Gerade Strecke" : "Kurve"}
              </span>
              <div className="flex gap-1 text-xs">
                <button
                  className="rounded border border-slate-300 px-2 py-0.5 disabled:opacity-30"
                  disabled={i === 0}
                  onClick={() => moveSection(section.id, -1)}
                >
                  ↑
                </button>
                <button
                  className="rounded border border-slate-300 px-2 py-0.5 disabled:opacity-30"
                  disabled={i === sections.length - 1}
                  onClick={() => moveSection(section.id, 1)}
                >
                  ↓
                </button>
                <button
                  className="rounded border border-red-300 px-2 py-0.5 text-red-600"
                  onClick={() => removeSection(section.id)}
                >
                  Löschen
                </button>
              </div>
            </div>
            {section.type === "straight" ? (
              <StraightRow section={section} />
            ) : (
              <BendRow section={section} />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
