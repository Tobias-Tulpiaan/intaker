export type Afzender = "tobias" | "ralf";

export type HandtekeningInfo = {
  naam: string;
  mobiel: string;
  telefoon: string;
  email: string;
  bedrijf: string;
  adres: string;
};

const HANDTEKENINGEN: Record<Afzender, HandtekeningInfo> = {
  tobias: {
    naam: "Tobias",
    mobiel: "06 30 53 53 20",
    telefoon: "085 060 7253",
    email: "Tobias@Tulpiaan.nl",
    bedrijf: "Tulpiaan",
    adres: "Boogschutterstraat 1, Apeldoorn",
  },
  ralf: {
    naam: "Ralf",
    mobiel: "06 45 81 88 96",
    telefoon: "085 060 7253",
    email: "Ralf@Tulpiaan.nl",
    bedrijf: "Tulpiaan",
    adres: "Boogschutterstraat 1, Apeldoorn",
  },
};

export function handtekeningFor(afzender: string): HandtekeningInfo {
  if (afzender === "ralf") return HANDTEKENINGEN.ralf;
  return HANDTEKENINGEN.tobias;
}

export function handtekeningTekst(afzender: string): string {
  const h = handtekeningFor(afzender);
  return [
    h.naam,
    `M. ${h.mobiel} | T. ${h.telefoon} | ${h.email}`,
    `${h.bedrijf} | ${h.adres}`,
  ].join("\n");
}
