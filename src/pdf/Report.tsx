import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { CalcResult } from "../engine/types";
import { formatPressure, mToMm, type PressureUnit } from "../engine/units";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, color: "#0f172a" },
  h1: { fontSize: 18, marginBottom: 4, fontWeight: 700 },
  meta: { fontSize: 9, color: "#475569", marginBottom: 12 },
  section: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 4, padding: 8, marginBottom: 8 },
  sectionTitle: { fontSize: 11, marginBottom: 4, fontWeight: 700 },
  line: { fontFamily: "Courier", fontSize: 9, marginBottom: 1 },
  total: { backgroundColor: "#e0f2fe", padding: 10, borderRadius: 4, marginTop: 8 },
  totalValue: { fontSize: 16, fontWeight: 700, color: "#075985" },
  footer: { position: "absolute", bottom: 20, left: 36, right: 36, fontSize: 8, color: "#94a3b8" },
});

const pUnit = (u: PressureUnit) => (u === "pa" ? "Pa" : u === "kpa" ? "kPa" : "bar");
const fmtP = (pa: number, u: PressureUnit) =>
  `${formatPressure(pa, u).toFixed(u === "pa" ? 1 : 4)} ${pUnit(u)}`;

interface Props {
  projectName: string;
  result: CalcResult;
  pressureUnit: PressureUnit;
  date: string;
  flowLabel: string;
}

export function Report({ projectName, result, pressureUnit, date, flowLabel }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Pumpen-Auslegung: {projectName}</Text>
        <Text style={styles.meta}>
          Datum: {date} · {result.fluid.label} · ρ = {result.fluid.density.toFixed(2)} kg/m³ · ν ={" "}
          {result.fluid.kinematicViscosity.toExponential(3)} m²/s · Volumenstrom Q = {flowLabel}
        </Text>
        <Text style={styles.meta}>
          Grundgleichung (Darcy-Weisbach): Δp = λ · (l/d) · (ρ/2) · v² ; Krümmer: Δp = ζ · (ρ/2) · v²
        </Text>

        {result.sections.map((r, i) => (
          <View key={r.id} style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>
              #{i + 1} · {r.type === "straight" ? "Gerade Strecke" : "Kurve"}
            </Text>
            <Text style={styles.line}>
              A = π/4·d² = {(r.area * 1e6).toFixed(1)} mm² (d = {mToMm(2 * Math.sqrt(r.area / Math.PI)).toFixed(1)} mm)
            </Text>
            <Text style={styles.line}>v = Q/A = {r.velocity.toFixed(3)} m/s</Text>
            <Text style={styles.line}>
              Re = v·d/ν = {r.reynolds.toFixed(0)} ({r.regime})
            </Text>
            {r.type === "straight" ? (
              <>
                <Text style={styles.line}>λ = {r.lambda!.toFixed(5)}</Text>
                <Text style={styles.line}>Δp = {fmtP(r.pressureDrop, pressureUnit)}</Text>
              </>
            ) : (
              <>
                <Text style={styles.line}>ζ = {r.zeta!.toFixed(3)}</Text>
                <Text style={styles.line}>Δp = {fmtP(r.pressureDrop, pressureUnit)}</Text>
              </>
            )}
          </View>
        ))}

        <View style={styles.total}>
          <Text>Gesamter Druckverlust</Text>
          <Text style={styles.totalValue}>Δp = {fmtP(result.totalPressureDrop, pressureUnit)}</Text>
          <Text>Erforderliche Förderhöhe H = Δp/(ρ·g) = {result.head.toFixed(2)} m</Text>
        </View>

        <Text style={styles.footer}>
          Erstellt mit DeltaP · Stoffwerte und ζ-Beiwerte aus Standardtabellen, Werte ohne Gewähr.
        </Text>
      </Page>
    </Document>
  );
}
