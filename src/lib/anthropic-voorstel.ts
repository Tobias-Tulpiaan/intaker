import { getAnthropic, VOORSTEL_MODEL } from "@/lib/anthropic";
import {
  VOORSTEL_SYSTEM,
  buildVoorstelUserPrompt,
  buildRegenereerUserPrompt,
} from "@/lib/intake-prompts";
import { prisma } from "@/lib/prisma";

export async function generateVoorstelViaAnthropic(
  intakeId: string,
  eerdereVersie?: string,
): Promise<string> {
  const intake = await prisma.intake.findUnique({
    where: { id: intakeId },
    include: { candidate: { select: { firstName: true, lastName: true } } },
  });
  if (!intake) throw new Error("Intake niet gevonden");

  const client = getAnthropic();
  const baseUserPrompt = buildVoorstelUserPrompt({
    kandidaatNaam: `${intake.candidate.firstName} ${intake.candidate.lastName}`,
    positionTitle: intake.positionTitle,
    clientName: intake.clientName,
    contactpersoon: intake.contactpersoon,
    afzender: intake.afzender,
    vacatureTekst: intake.vacatureTekst,
    werkervaringTekst: intake.werkervaringTekst,
    woonplaats: intake.woonplaats,
    leeftijd: intake.leeftijd,
    priveSituatie: intake.priveSituatie,
    huidigeWerkgever: intake.huidigeWerkgever,
    huidigeRol: intake.huidigeRol,
    huidigeRolToelichting: intake.huidigeRolToelichting,
    klantsegment: intake.klantsegment,
    eerdereErvaring: intake.eerdereErvaring,
    redenVervolgstap: intake.redenVervolgstap,
    matchToelichting: intake.matchToelichting,
    anekdote: intake.anekdote,
    haakjes: intake.haakjes,
    nuance: intake.nuance,
    uren: intake.uren,
    salaris: intake.salaris,
    bonusLease: intake.bonusLease,
    opzegtermijn: intake.opzegtermijn,
    beschikbaarheid: intake.beschikbaarheid,
    hybride: intake.hybride,
    kladblok: intake.kladblok,
    matchAnalyse: intake.matchAnalyse,
    ankerZin: intake.ankerZin,
    verzwijgDit: intake.verzwijgDit,
    vrijInvullenTekst: intake.vrijInvullenTekst,
  });

  const userPrompt =
    eerdereVersie && eerdereVersie.trim()
      ? buildRegenereerUserPrompt(baseUserPrompt, eerdereVersie.trim())
      : baseUserPrompt;

  const msg = await client.messages.create({
    model: VOORSTEL_MODEL,
    max_tokens: 4000,
    system: [
      {
        type: "text",
        text: VOORSTEL_SYSTEM,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = msg.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Anthropic-response bevatte geen tekst-blok");
  }
  return textBlock.text.trim();
}
