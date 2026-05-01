import { prisma } from "@/lib/prisma";

export type OpMaatVraag = {
  tag: "warm" | "functie" | "haakje" | "anekdote";
  vraag: string;
  afgevinkt?: boolean;
};

export type VoorstelStijl = "recht" | "warm" | "pareltje" | "zorgvuldig";

export type SuggestieType = "spelling" | "grammatica" | "stijl" | "interpunctie";

export type Suggestie = {
  id: string;
  regel_index: number;
  origineel: string;
  voorgesteld: string;
  type: SuggestieType;
  uitleg: string;
};

const STUB_VRAGEN: OpMaatVraag[] = [
  { tag: "warm", vraag: "Werk je vandaag thuis of op kantoor? En hoe is je dag tot nu toe?" },
  { tag: "warm", vraag: "Wat haal je het meeste voldoening uit in je huidige werk?" },
  { tag: "functie", vraag: "Welke onderdelen van het functieprofiel spreken je het meest aan, en welke roepen vragen op?" },
  { tag: "functie", vraag: "Welke verantwoordelijkheid uit je huidige rol zou je in een nieuwe rol mee willen nemen?" },
  { tag: "functie", vraag: "Hoe ziet jouw ideale week eruit qua werkzaamheden?" },
  { tag: "haakje", vraag: "Heb je weleens samengewerkt met iemand uit het team van de opdrachtgever?" },
  { tag: "anekdote", vraag: "Heb je een recent voorbeeld van een situatie waarin jouw aanpak het verschil maakte, een klant, een actie, een uitkomst?" },
];

const STUB_VOORSTEL =
  "Hi,\n\n[Voorstel-stub. ANTHROPIC_API_KEY ontbreekt of de Anthropic-call faalde.]\n\nIk ben benieuwd of jullie de match zien en of je deze kandidaat graag wilt ontmoeten.";

export async function generateVragen(intakeId: string): Promise<OpMaatVraag[]> {
  const intake = await prisma.intake.findUnique({
    where: { id: intakeId },
    select: {
      positionTitle: true,
      clientName: true,
      vacatureTekst: true,
      werkervaringTekst: true,
      bedrijfsUrl: true,
      bedrijfsTekst: true,
      candidate: { select: { firstName: true, lastName: true } },
    },
  });

  const realCall = await tryRealVragenCall(intake);
  if (realCall) return realCall;

  return STUB_VRAGEN;
}

export async function generateVoorstel(intakeId: string): Promise<string> {
  const real = await tryRealVoorstelCall(intakeId, undefined);
  if (real) return real;
  return STUB_VOORSTEL;
}

export async function regenereerVoorstel(
  intakeId: string,
  eerdereVersie: string,
): Promise<string> {
  const real = await tryRealVoorstelCall(intakeId, eerdereVersie);
  if (real) return real;
  return STUB_VOORSTEL;
}

export async function checkTekst(tekst: string): Promise<Suggestie[]> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY ontbreekt — AI-modi niet beschikbaar");
  }
  const { generateCheckSuggesties } = await import("@/lib/anthropic-suggesties");
  return await generateCheckSuggesties(tekst);
}

export async function verbeterTekst(tekst: string): Promise<Suggestie[]> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY ontbreekt — AI-modi niet beschikbaar");
  }
  const { generateVerbeterSuggesties } = await import("@/lib/anthropic-suggesties");
  return await generateVerbeterSuggesties(tekst);
}

async function tryRealVragenCall(
  intake: {
    positionTitle: string | null;
    clientName: string | null;
    vacatureTekst: string | null;
    werkervaringTekst: string | null;
    bedrijfsUrl: string | null;
    bedrijfsTekst: string | null;
    candidate: { firstName: string; lastName: string };
  } | null,
): Promise<OpMaatVraag[] | null> {
  if (!intake) return null;
  if (!process.env.ANTHROPIC_API_KEY) return null;
  try {
    const { generateVragenViaAnthropic } = await import("@/lib/anthropic-vragen");
    return await generateVragenViaAnthropic({
      positionTitle: intake.positionTitle,
      clientName: intake.clientName,
      kandidaatNaam: `${intake.candidate.firstName} ${intake.candidate.lastName}`,
      vacatureTekst: intake.vacatureTekst,
      werkervaringTekst: intake.werkervaringTekst,
      bedrijfsUrl: intake.bedrijfsUrl,
      bedrijfsTekst: intake.bedrijfsTekst,
    });
  } catch {
    return null;
  }
}

async function tryRealVoorstelCall(
  intakeId: string,
  eerdereVersie: string | undefined,
): Promise<string | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  try {
    const { generateVoorstelViaAnthropic } = await import("@/lib/anthropic-voorstel");
    return await generateVoorstelViaAnthropic(intakeId, eerdereVersie);
  } catch {
    return null;
  }
}
