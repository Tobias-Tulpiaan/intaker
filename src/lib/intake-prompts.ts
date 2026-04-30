import type { VoorstelStijl } from "@/lib/intake-ai";

export const VRAGEN_SYSTEM = `Je bent een ervaren werving-en-selectie-recruiter bij Tulpiaan, een bureau in Apeldoorn dat hechte, persoonlijke matches maakt tussen kandidaten en opdrachtgevers.

Jouw taak: lees de vacaturetekst, werkervaring van de kandidaat en de bedrijfswebsite van de opdrachtgever. Genereer 5-7 op-maat-vragen die de recruiter tijdens een telefonische intake (20-40 minuten) kan stellen.

Tags voor de vragen:
- "warm" (1-2x) — opener, persoonlijk, niet-zakelijk. Doel: verbinding maken.
- "functie" (3-4x) — over de aansluiting tussen huidige rol/expertise en de vacature.
- "haakje" (1-2x) — verwijst naar specifieke namen, projecten, klanten of teamleden uit de bedrijfswebsite die de kandidaat kan herkennen of waar hij een mening over heeft. Doel: gemeenschappelijk grondvlak.
- "anekdote" (1x) — triggert tot specificiteit. Vraag om een concrete situatie: een klant, een actie, een uitkomst. Niet abstract.

Tone of voice: Tulpiaan-stijl — direct, warm, persoonlijk, geen corporate jargon. Schrijf in 'je'-vorm. Vragen zijn open, niet ja/nee.

Output: ALLEEN een geldig JSON-array, geen extra tekst eromheen. Voorbeeld:
[
  {"tag":"warm","vraag":"Werk je vandaag thuis of op kantoor? Hoe is je dag tot nu toe?"},
  {"tag":"functie","vraag":"..."}
]`;

export function buildVragenUserPrompt(intake: {
  vacatureTekst: string | null;
  werkervaringTekst: string | null;
  bedrijfsUrl: string | null;
  bedrijfsTekst: string | null;
}): string {
  const parts: string[] = [];

  if (intake.vacatureTekst) {
    parts.push(`### Vacaturetekst\n${intake.vacatureTekst}`);
  }
  if (intake.werkervaringTekst) {
    parts.push(`### Werkervaring kandidaat\n${intake.werkervaringTekst}`);
  }
  if (intake.bedrijfsUrl || intake.bedrijfsTekst) {
    const url = intake.bedrijfsUrl ? `URL: ${intake.bedrijfsUrl}\n` : "";
    const tekst = intake.bedrijfsTekst ? intake.bedrijfsTekst : "(geen extra tekst opgehaald)";
    parts.push(`### Bedrijfswebsite\n${url}${tekst}`);
  }

  if (parts.length === 0) {
    parts.push(
      "Er is nog weinig info ingevuld. Genereer algemene maar warme intake-vragen die voor elke kandidaat werken.",
    );
  }

  return parts.join("\n\n");
}

const STIJL_INSTRUCTIES: Record<VoorstelStijl, string> = {
  recht:
    "STIJL: RECHT DOOR ZEE. Kort, krachtig, geen omhaal. 4-5 alinea's. Structuur: pitch-zin in opening, huidige rol, eerdere ervaring, reden + match, harde feiten als bullets, korte afsluiter. Tutoyeren ('je'). Eindig met een variant van 'Ben benieuwd wat je ervan vindt'.",
  warm:
    "STIJL: WARM VERHAAL. Uitgebreid, persoonlijk, met anekdote en context. 7-9 alinea's. Bouw beeld op van de mens achter het CV. Verwerk de anekdote prominent als die er is. Tutoyeren ('je'). Eindig met een persoonlijke variant van 'Ben benieuwd wat je ervan vindt'.",
  pareltje:
    "STIJL: PARELTJE GEVONDEN. Begin enthousiast en met urgentie ('soms gaat het snel — vandaag spraken we…'). Nadruk op uniciteit en passendheid. 5-7 alinea's. Tutoyeren ('je'). Eindig met een aansporende variant van 'Ben benieuwd wat je ervan vindt — laat het me snel weten'.",
  zorgvuldig:
    "STIJL: ZORGVULDIG & ONDERBOUWD. Feitelijk, gestructureerd, formele aanhef ('Goedemiddag,'). 6-8 alinea's. Vousvoyeren ('u'). Benoem expliciet de nuance/kanttekening als die er is — eerlijk vooraf is beter dan verrassing. Eindig met 'Ik hoor graag uw reactie' of vergelijkbaar formeel.",
};

export const VOORSTEL_SYSTEM_BASE = `Je bent een ervaren werving-en-selectie-recruiter bij Tulpiaan in Apeldoorn. Je schrijft voorsteltekst-mails aan opdrachtgevers waarin je een kandidaat voorstelt na een telefonische intake.

Algemene tone of voice: warm, direct, persoonlijk, geen corporate jargon. Tulpiaan-stijl. Nederlands.

Verplichte richtlijnen voor ELKE stijl:
- Gebruik de anekdote-veld als die ingevuld is — dat is vaak de sterkste zin in het voorstel.
- Verwerk haakjes (netwerkconnecties) als die ingevuld zijn — dat verlaagt de drempel bij de opdrachtgever.
- Benoem nuance/kanttekening als die ingevuld is — eerlijk vooraf is beter dan verrassing tijdens een gesprek.
- Eindig altijd met een variant van 'Ben benieuwd wat je ervan vindt'.
- GEEN handtekening eronder zetten — die voegt het systeem toe.
- Geen Markdown, geen bullets behalve waar de stijl het expliciet voorschrijft.

Output: ALLEEN de voorsteltekst zelf, geen toelichting eromheen, geen meta-commentaar.`;

export function voorstelSystemFor(stijl: VoorstelStijl): string {
  return `${VOORSTEL_SYSTEM_BASE}\n\n${STIJL_INSTRUCTIES[stijl]}`;
}

export function buildVoorstelUserPrompt(intake: {
  candidate: { firstName: string; lastName: string };
  positionTitle: string | null;
  clientName: string | null;
  contactpersoon: string | null;
  woonplaats: string | null;
  leeftijd: string | null;
  priveSituatie: string | null;
  huidigeWerkgever: string | null;
  huidigeRol: string | null;
  huidigeRolToelichting: string | null;
  klantsegment: string | null;
  eerdereErvaring: string | null;
  redenVervolgstap: string | null;
  matchToelichting: string | null;
  anekdote: string | null;
  haakjes: string | null;
  nuance: string | null;
  uren: string | null;
  salaris: string | null;
  bonusLease: string | null;
  opzegtermijn: string | null;
  beschikbaarheid: string | null;
  hybride: string | null;
  vacatureTekst: string | null;
}): string {
  const lines: string[] = [];
  const naam = `${intake.candidate.firstName} ${intake.candidate.lastName}`;
  lines.push(`### Kandidaat: ${naam}`);
  if (intake.contactpersoon) lines.push(`Contactpersoon opdrachtgever: ${intake.contactpersoon}`);
  if (intake.clientName) lines.push(`Opdrachtgever: ${intake.clientName}`);
  if (intake.positionTitle) lines.push(`Functie: ${intake.positionTitle}`);
  lines.push("");

  const pushIf = (label: string, value: string | null) => {
    if (value && value.trim()) lines.push(`${label}: ${value.trim()}`);
  };

  lines.push("### Persoonlijk");
  pushIf("Woonplaats", intake.woonplaats);
  pushIf("Leeftijd", intake.leeftijd);
  pushIf("Privé-situatie", intake.priveSituatie);
  lines.push("");

  lines.push("### Huidige situatie");
  pushIf("Werkgever", intake.huidigeWerkgever);
  pushIf("Rol", intake.huidigeRol);
  pushIf("Toelichting rol", intake.huidigeRolToelichting);
  pushIf("Klantsegment", intake.klantsegment);
  lines.push("");

  lines.push("### Inhoudelijk");
  pushIf("Eerdere ervaring", intake.eerdereErvaring);
  pushIf("Reden vervolgstap", intake.redenVervolgstap);
  pushIf("Match met functie", intake.matchToelichting);
  pushIf("Anekdote (concreet)", intake.anekdote);
  pushIf("Haakjes / netwerk", intake.haakjes);
  pushIf("Nuance / kanttekening", intake.nuance);
  lines.push("");

  lines.push("### Harde feiten");
  pushIf("Uren", intake.uren);
  pushIf("Salaris", intake.salaris);
  pushIf("Bonus / lease", intake.bonusLease);
  pushIf("Opzegtermijn", intake.opzegtermijn);
  pushIf("Beschikbaarheid", intake.beschikbaarheid);
  pushIf("Hybride / kantoor", intake.hybride);
  lines.push("");

  if (intake.vacatureTekst) {
    lines.push("### Vacaturetekst (referentie)");
    lines.push(intake.vacatureTekst);
  }

  return lines.join("\n");
}
