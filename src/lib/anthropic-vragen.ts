import { getAnthropic, VRAGEN_MODEL } from "@/lib/anthropic";
import { VRAGEN_SYSTEM, buildVragenUserPrompt } from "@/lib/intake-prompts";
import type { OpMaatVraag } from "@/lib/intake-ai";

export async function generateVragenViaAnthropic(intake: {
  vacatureTekst: string | null;
  werkervaringTekst: string | null;
  bedrijfsUrl: string | null;
  bedrijfsTekst: string | null;
}): Promise<OpMaatVraag[]> {
  const client = getAnthropic();
  const userPrompt = buildVragenUserPrompt(intake);

  const msg = await client.messages.create({
    model: VRAGEN_MODEL,
    max_tokens: 2000,
    system: [
      {
        type: "text",
        text: VRAGEN_SYSTEM,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = msg.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Anthropic-response bevatte geen tekst-blok");
  }

  const raw = textBlock.text.trim();
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(
      `JSON-parse faalde op AI-output: ${
        err instanceof Error ? err.message : "onbekend"
      }. Output begin: ${cleaned.slice(0, 200)}`,
    );
  }
  if (!Array.isArray(parsed)) {
    throw new Error("AI-output was geen array");
  }

  const vragen: OpMaatVraag[] = [];
  const validTags: OpMaatVraag["tag"][] = ["warm", "functie", "haakje", "anekdote"];
  for (const item of parsed) {
    if (
      item &&
      typeof item === "object" &&
      "tag" in item &&
      "vraag" in item &&
      typeof (item as { tag: unknown }).tag === "string" &&
      typeof (item as { vraag: unknown }).vraag === "string" &&
      validTags.includes((item as { tag: OpMaatVraag["tag"] }).tag)
    ) {
      vragen.push({
        tag: (item as { tag: OpMaatVraag["tag"] }).tag,
        vraag: (item as { vraag: string }).vraag,
      });
    }
  }
  if (vragen.length === 0) {
    throw new Error("AI-output bevatte geen geldige vragen");
  }
  return vragen;
}
