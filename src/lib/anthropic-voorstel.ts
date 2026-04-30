import { getAnthropic, VOORSTEL_MODEL } from "@/lib/anthropic";
import { voorstelSystemFor, buildVoorstelUserPrompt } from "@/lib/intake-prompts";
import { prisma } from "@/lib/prisma";
import type { VoorstelStijl } from "@/lib/intake-ai";

export async function generateVoorstelViaAnthropic(
  intakeId: string,
  stijl: VoorstelStijl,
): Promise<string> {
  const intake = await prisma.intake.findUnique({
    where: { id: intakeId },
    include: { candidate: { select: { firstName: true, lastName: true } } },
  });
  if (!intake) throw new Error("Intake niet gevonden");

  const client = getAnthropic();
  const system = voorstelSystemFor(stijl);
  const userPrompt = buildVoorstelUserPrompt(intake);

  const msg = await client.messages.create({
    model: VOORSTEL_MODEL,
    max_tokens: 4000,
    system: [
      {
        type: "text",
        text: system,
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
