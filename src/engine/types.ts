export type FluidId = "water" | "custom";

export interface FluidState {
  id: FluidId;
  /** Temperatur in °C (nur relevant für Wasser; bei custom optional informativ) */
  temperatureC: number;
  /** Nur für custom: Dichte in kg/m³ */
  customDensity?: number;
  /** Nur für custom: kinematische Viskosität in m²/s */
  customKinematicViscosity?: number;
}

/** Aufgelöste Stoffwerte bei der gewählten Temperatur (SI) */
export interface FluidProperties {
  label: string;
  /** Dichte ρ in kg/m³ */
  density: number;
  /** kinematische Viskosität ν in m²/s */
  kinematicViscosity: number;
}

export type SectionType = "straight" | "bend";

export interface StraightSection {
  id: string;
  type: "straight";
  /** Länge l in m */
  length: number;
  /** Innendurchmesser d in m */
  diameter: number;
  /** absolute Rohrrauheit ε in m */
  roughness: number;
}

export interface BendSection {
  id: string;
  type: "bend";
  /** Umlenkwinkel in ° */
  angle: number;
  /** Innendurchmesser d in m */
  diameter: number;
  /** Radienverhältnis R/d (Krümmungsradius / Durchmesser) */
  radiusRatio: number;
  /** Optionaler manueller ζ-Override (überschreibt Tabellenwert) */
  manualZeta?: number;
}

export type Section = StraightSection | BendSection;

export type FlowRegime = "laminar" | "transitional" | "turbulent";

export interface SectionResult {
  id: string;
  type: SectionType;
  /** Querschnittsfläche A in m² */
  area: number;
  /** Strömungsgeschwindigkeit v in m/s */
  velocity: number;
  /** Reynolds-Zahl */
  reynolds: number;
  regime: FlowRegime;
  /** Rohrreibungszahl λ (nur straight) */
  lambda?: number;
  /** Widerstandsbeiwert ζ (nur bend) */
  zeta?: number;
  /** Druckverlust Δp in Pa */
  pressureDrop: number;
}

export interface CalcResult {
  fluid: FluidProperties;
  /** Volumenstrom Q in m³/s */
  flow: number;
  sections: SectionResult[];
  /** Gesamtdruckverlust Δp in Pa */
  totalPressureDrop: number;
  /** Erforderliche Förderhöhe H in m */
  head: number;
}
