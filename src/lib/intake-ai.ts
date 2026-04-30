import { prisma } from "@/lib/prisma";

export type OpMaatVraag = {
  tag: "warm" | "functie" | "haakje" | "anekdote";
  vraag: string;
  afgevinkt?: boolean;
};

export type VoorstelStijl = "recht" | "warm" | "pareltje" | "zorgvuldig";

const STUB_VRAGEN: OpMaatVraag[] = [
  { tag: "warm", vraag: "Werk je vandaag thuis of op kantoor? En hoe is je dag tot nu toe?" },
  { tag: "warm", vraag: "Wat haal je het meeste voldoening uit in je huidige werk?" },
  { tag: "functie", vraag: "Welke onderdelen van het functieprofiel spreken je het meest aan, en welke roepen vragen op?" },
  { tag: "functie", vraag: "Welke verantwoordelijkheid uit je huidige rol zou je in een nieuwe rol mee willen nemen?" },
  { tag: "functie", vraag: "Hoe ziet jouw ideale week eruit qua werkzaamheden?" },
  { tag: "haakje", vraag: "Heb je weleens samengewerkt met iemand uit het team van de opdrachtgever?" },
  { tag: "anekdote", vraag: "Heb je een recent voorbeeld van een situatie waarin jouw aanpak het verschil maakte — een klant, een actie, een uitkomst?" },
];

export async function generateVragen(intakeId: string): Promise<OpMaatVraag[]> {
  const intake = await prisma.intake.findUnique({
    where: { id: intakeId },
    select: {
      vacatureTekst: true,
      werkervaringTekst: true,
      bedrijfsUrl: true,
      bedrijfsTekst: true,
    },
  });

  const realCall = await tryRealVragenCall(intake);
  if (realCall) return realCall;

  return STUB_VRAGEN;
}

export async function generateVoorstel(
  intakeId: string,
  stijl: VoorstelStijl,
): Promise<string> {
  const real = await tryRealVoorstelCall(intakeId, stijl);
  if (real) return real;

  const stub = STIJL_STUB[stijl] ?? STIJL_STUB.recht;
  return stub;
}

const STIJL_STUB: Record<VoorstelStijl, string> = {
  recht:
    "Hoi,\n\n[Voorstel-stub — Anthropic-koppeling staat nog niet aan op deze omgeving. Stel ANTHROPIC_API_KEY in om echte voorsteltekst te genereren.]\n\nBen benieuwd wat je ervan vindt.",
  warm:
    "Hoi,\n\n[Warm-stub — vul ANTHROPIC_API_KEY in om een echte voorsteltekst te krijgen.]\n\nBen benieuwd wat je ervan vindt.",
  pareltje:
    "Hoi — soms gaat het snel.\n\n[Pareltje-stub — vul ANTHROPIC_API_KEY in.]\n\nBen benieuwd wat je ervan vindt.",
  zorgvuldig:
    "Goedemiddag,\n\n[Zorgvuldig-stub — vul ANTHROPIC_API_KEY in voor een uitgewerkte tekst.]\n\nMet vriendelijke groet,",
};

async function tryRealVragenCall(
  intake: {
    vacatureTekst: string | null;
    werkervaringTekst: string | null;
    bedrijfsUrl: string | null;
    bedrijfsTekst: string | null;
  } | null,
): Promise<OpMaatVraag[] | null> {
  if (!intake) return null;
  if (!process.env.ANTHROPIC_API_KEY) return null;
  try {
    const { generateVragenViaAnthropic } = await import("@/lib/anthropic-vragen");
    return await generateVragenViaAnthropic(intake);
  } catch {
    return null;
  }
}

async function tryRealVoorstelCall(
  intakeId: string,
  stijl: VoorstelStijl,
): Promise<string | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  try {
    const { generateVoorstelViaAnthropic } = await import("@/lib/anthropic-voorstel");
    return await generateVoorstelViaAnthropic(intakeId, stijl);
  } catch {
    return null;
  }
}
