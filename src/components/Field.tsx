interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  unit?: string;
}

export function NumberField({ label, value, onChange, step, min, unit }: NumberFieldProps) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-slate-600">{label}</span>
      <div className="flex items-center gap-1">
        <input
          type="number"
          className="w-full rounded border border-slate-300 px-2 py-1 focus:border-sky-500 focus:outline-none"
          value={Number.isFinite(value) ? value : ""}
          step={step ?? "any"}
          min={min}
          onChange={(e) => onChange(parseFloat(e.target.value))}
        />
        {unit && <span className="text-slate-400">{unit}</span>}
      </div>
    </label>
  );
}
