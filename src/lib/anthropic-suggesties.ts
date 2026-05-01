import { getAnthropic, VRAGEN_MODEL, VOORSTEL_MODEL } from "@/lib/anthropic";
import {
  CHECK_TEKST_SYSTEM,
  VERBETER_TEKST_SYSTEM,
  PAS_AAN_SYSTEM,
  buildCheckTekstUserPrompt,
  buildVerbeterTekstUserPrompt,
  buildPasAanUserPrompt,
} from "@/lib/intake-prompts";
import type { Suggestie, SuggestieType } from "@/lib/intake-ai";

const VALID_TYPES: SuggestieType[] = [
  "spelling",
  "grammatica",
  "stijl",
  "interpunctie",
];

function parseSuggesties(raw: string): Suggestie[] {
  const cleaned = raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(
      `JSON-parse faalde: ${
        err instanceof Error ? err.message : "onbekend"
      }. Output: ${cleaned.slice(0, 200)}`,
    );
  }
  if (!parsed || typeof parsed !== "object" || !("suggesties" in parsed)) {
    throw new Error("Output bevatte geen 'suggesties'-veld");
  }
  const list = (parsed as { suggesties: unknown }).suggesties;
  if (!Array.isArray(list)) throw new Error("'suggesties' is geen array");

  const out: Suggestie[] = [];
  for (let i = 0; i < list.length; i++) {
    const item = list[i] as Record<string, unknown> | null;
    if (!item || typeof item !== "object") continue;
    const id = typeof item.id === "string" && item.id ? item.id : `s${i}`;
    const regel_index =
      typeof item.regel_index === "number" ? item.regel_index : 0;
    const origineel =
      typeof item.origineel === "string" ? item.origineel : null;
    const voorgesteld =
      typeof item.voorgesteld === "string" ? item.voorgesteld : null;
    const tRaw = typeof item.type === "string" ? item.type : "";
    const type = (VALID_TYPES as string[]).includes(tRaw)
      ? (tRaw as SuggestieType)
      : "stijl";
    const uitleg = typeof item.uitleg === "string" ? item.uitleg : "";
    if (!origineel || !voorgesteld) continue;
    if (origineel === voorgesteld) continue;
    out.push({ id, regel_index, origineel, voorgesteld, type, uitleg });
  }
  return out;
}

export async function generateCheckSuggesties(
  tekst: string,
): Promise<Suggestie[]> {
  const client = getAnthropic();
  const msg = await client.messages.create({
    model: VRAGEN_MODEL,
    max_tokens: 2000,
    system: [
      {
        type: "text",
        text: CHECK_TEKST_SYSTEM,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: buildCheckTekstUserPrompt(tekst) }],
  });
  const block = msg.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") {
    throw new Error("Anthropic-response bevatte geen tekst-blok");
  }
  return parseSuggesties(block.text);
}

export async function generateVerbeterSuggesties(
  tekst: string,
): Promise<Suggestie[]> {
  const client = getAnthropic();
  const msg = await client.messages.create({
    model: VOORSTEL_MODEL,
    max_tokens: 4000,
    system: [
      {
        type: "text",
        text: VERBETER_TEKST_SYSTEM,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: buildVerbeterTekstUserPrompt(tekst) }],
  });
  const block = msg.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") {
    throw new Error("Anthropic-response bevatte geen tekst-blok");
  }
  return parseSuggesties(block.text);
}

export async function generatePasAanSuggesties(
  tekst: string,
  opmerkingen: string,
): Promise<Suggestie[]> {
  const client = getAnthropic();
  const msg = await client.messages.create({
    model: VOORSTEL_MODEL,
    max_tokens: 4000,
    system: [
      {
        type: "text",
        text: PAS_AAN_SYSTEM,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      { role: "user", content: buildPasAanUserPrompt(tekst, opmerkingen) },
    ],
  });
  const block = msg.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") {
    throw new Error("Anthropic-response bevatte geen tekst-blok");
  }
  return parseSuggesties(block.text);
}
