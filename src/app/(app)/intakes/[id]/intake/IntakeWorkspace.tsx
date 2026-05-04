"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Clock, Sparkles, Lightbulb, ChevronDown, ChevronUp, Check } from "lucide-react";
import { useAutoSave } from "@/components/intake/useAutoSave";
import type { OpMaatVraag } from "@/lib/intake-ai";

type IntakeFields = {
  woonplaats: string;
  leeftijd: string;
  priveSituatie: string;
  huidigeWerkgever: string;
  huidigeRol: string;
  huidigeRolToelichting: string;
  klantsegment: string;
  eerdereErvaring: string;
  redenVervolgstap: string;
  matchToelichting: string;
  anekdote: string;
  haakjes: string;
  nuance: string;
  uren: string;
  salaris: string;
  bonusLease: string;
  opzegtermijn: string;
  beschikbaarheid: string;
  hybride: string;
  kladblok: string;
  vrijInvullenTekst: string;
  opMaatVragen: OpMaatVraag[];
};

const ONDERWERPEN = [
  "Persoonlijk",
  "Huidige situatie",
  "Eerdere ervaring",
  "Reden vervolgstap",
  "Match met functie",
  "Anekdote",
  "Haakjes / netwerk",
  "Nuance / kanttekening",
  "Harde feiten",
];

const TAG_LABELS: Record<OpMaatVraag["tag"], string> = {
  warm: "Warm",
  functie: "Functie",
  haakje: "Haakje",
  anekdote: "Anekdote",
};

const TAG_COLORS: Record<OpMaatVraag["tag"], string> = {
  warm: "bg-amber-100 text-amber-900",
  functie: "bg-blue-100 text-blue-900",
  haakje: "bg-purple-100 text-purple-900",
  anekdote: "bg-green-100 text-green-900",
};

export function IntakeWorkspace({
  intakeId,
  initial,
  opMaatVragen,
}: {
  intakeId: string;
  initial: IntakeFields;
  opMaatVragen: OpMaatVraag[];
}) {
  const { values, set, status, errorMsg, flush } = useAutoSave<IntakeFields>(
    intakeId,
    initial,
    2000,
  );
  const [kladblokOpenMobile, setKladblokOpenMobile] = useState(false);
  const [vragenOpen, setVragenOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"vrij" | "vragenlijst">("vrij");
  const kladblokRef = useRef<HTMLTextAreaElement | null>(null);

  function insertTime() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const tag = `[${hh}:${mm}] `;
    const ta = kladblokRef.current;
    if (!ta) {
      set("kladblok", (values.kladblok ?? "") + tag);
      return;
    }
    const start = ta.selectionStart ?? 0;
    const end = ta.selectionEnd ?? 0;
    const before = values.kladblok.slice(0, start);
    const after = values.kladblok.slice(end);
    const next = before + tag + after;
    set("kladblok", next);
    requestAnimationFrame(() => {
      const pos = before.length + tag.length;
      ta.focus();
      ta.setSelectionRange(pos, pos);
    });
  }

  function toggleVraag(idx: number) {
    const next = values.opMaatVragen.map((v, i) =>
      i === idx ? { ...v, afgevinkt: !v.afgevinkt } : v,
    );
    set("opMaatVragen", next);
  }

  return (
    <div className="lg:flex lg:gap-6">
      {/* Sticky kladblok — desktop */}
      <aside className="hidden lg:block w-[320px] shrink-0">
        <div className="sticky top-4">
          <KladblokCard
            value={values.kladblok}
            onChange={(v) => set("kladblok", v)}
            onInsertTime={insertTime}
            textareaRef={kladblokRef}
            status={status}
            errorMsg={errorMsg}
          />
        </div>
      </aside>

      {/* Hoofdgedeelte */}
      <div className="flex-1 max-w-[800px] mx-auto lg:mx-0 space-y-4">
        {/* Save indicator (zichtbaar op mobiel boven aan content) */}
        <div className="lg:hidden">
          <SaveIndicator status={status} errorMsg={errorMsg} />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-tulpiaan-grijs/30">
          <TabButton
            active={activeTab === "vrij"}
            onClick={() => setActiveTab("vrij")}
          >
            Vrij invullen
          </TabButton>
          <TabButton
            active={activeTab === "vragenlijst"}
            onClick={() => setActiveTab("vragenlijst")}
          >
            Vragenlijst
          </TabButton>
        </div>

        {activeTab === "vrij" && (
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4">
            <aside className="rounded-lg border border-black/[0.08] bg-tulpiaan-wit p-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-tulpiaan-grijs mb-2">
                Onderwerpen om te dekken
              </h3>
              <ol className="text-xs text-tulpiaan-grijs space-y-1">
                {ONDERWERPEN.map((titel, i) => (
                  <li key={titel} className="flex gap-2">
                    <span className="text-tulpiaan-grijs/60 shrink-0">{i + 1}.</span>
                    <span>{titel}</span>
                  </li>
                ))}
              </ol>
            </aside>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="vrijInvullenTekst"
                  className="text-sm font-medium text-tulpiaan-zwart"
                >
                  Plak of typ hier alles van het gesprek
                </label>
                <span className="hidden md:inline">
                  <SaveIndicator status={status} errorMsg={errorMsg} />
                </span>
              </div>
              <p className="text-xs text-tulpiaan-grijs mb-2">
                Werk in je eigen volgorde, hoeft niet gestructureerd. AI haalt
                er straks de juiste informatie uit.
              </p>
              <textarea
                id="vrijInvullenTekst"
                value={values.vrijInvullenTekst}
                onChange={(e) => set("vrijInvullenTekst", e.target.value)}
                placeholder="Begin gewoon met typen…"
                className="w-full min-h-[500px] rounded border border-black/[0.08] bg-white p-4 text-sm text-tulpiaan-zwart focus:outline-none focus:ring-2 focus:ring-tulpiaan-goud leading-relaxed resize-y"
              />
            </div>
          </div>
        )}

        {activeTab === "vragenlijst" && (
          <>

        {/* Tip-callout */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-900">
            <strong>Stap niet meteen in zakelijke vragen.</strong> Begin warm — vraag
            waar diegene zit, hoe de dag verloopt.
          </p>
        </div>

        {/* Op-maat-vragen-kaart */}
        {opMaatVragen.length > 0 && (
          <Card>
            <button
              type="button"
              onClick={() => setVragenOpen((v) => !v)}
              className="w-full flex items-center justify-between text-left"
            >
              <h2 className="text-base font-semibold text-tulpiaan-zwart">
                Op-maat-vragen ({opMaatVragen.length})
              </h2>
              {vragenOpen ? (
                <ChevronUp className="h-4 w-4 text-tulpiaan-grijs" />
              ) : (
                <ChevronDown className="h-4 w-4 text-tulpiaan-grijs" />
              )}
            </button>
            {vragenOpen && (
              <ul className="mt-3 space-y-2">
                {values.opMaatVragen.map((v, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => toggleVraag(idx)}
                      aria-label={v.afgevinkt ? "Vraag afvinken ongedaan" : "Vraag afvinken"}
                      className={
                        "h-5 w-5 mt-0.5 rounded border flex items-center justify-center shrink-0 " +
                        (v.afgevinkt
                          ? "bg-tulpiaan-goud border-tulpiaan-goud"
                          : "border-tulpiaan-grijs/40 hover:border-tulpiaan-goud")
                      }
                    >
                      {v.afgevinkt && <Check className="h-3 w-3 text-tulpiaan-zwart" />}
                    </button>
                    <div className="flex-1 flex items-baseline gap-2 flex-wrap">
                      <span
                        className={
                          "inline-block text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 " +
                          TAG_COLORS[v.tag]
                        }
                      >
                        {TAG_LABELS[v.tag]}
                      </span>
                      <span
                        className={
                          "text-sm " +
                          (v.afgevinkt ? "text-tulpiaan-grijs line-through" : "text-tulpiaan-zwart")
                        }
                      >
                        {v.vraag}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}

        {/* 1. Persoonlijk */}
        <Section title="1. Persoonlijk">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Woonplaats" value={values.woonplaats} onChange={(v) => set("woonplaats", v)} />
            <Input label="Leeftijd" value={values.leeftijd} onChange={(v) => set("leeftijd", v)} />
          </div>
          <Textarea
            label="Privé-situatie"
            rows={3}
            value={values.priveSituatie}
            onChange={(v) => set("priveSituatie", v)}
          />
        </Section>

        {/* 2. Huidige situatie */}
        <Section title="2. Huidige situatie">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Werkgever" value={values.huidigeWerkgever} onChange={(v) => set("huidigeWerkgever", v)} />
            <Input label="Rol" value={values.huidigeRol} onChange={(v) => set("huidigeRol", v)} />
          </div>
          <Textarea
            label="Toelichting rol"
            rows={3}
            value={values.huidigeRolToelichting}
            onChange={(v) => set("huidigeRolToelichting", v)}
          />
          <Textarea
            label="Klantsegment / type opdrachten"
            rows={3}
            value={values.klantsegment}
            onChange={(v) => set("klantsegment", v)}
          />
        </Section>

        {/* 3. Eerdere ervaring */}
        <Section title="3. Eerdere ervaring">
          <Textarea
            label=""
            rows={4}
            value={values.eerdereErvaring}
            onChange={(v) => set("eerdereErvaring", v)}
          />
        </Section>

        {/* 4. Reden vervolgstap (cruciaal) */}
        <Section title="4. Reden vervolgstap" cruciaal>
          <Textarea
            label=""
            rows={4}
            value={values.redenVervolgstap}
            onChange={(v) => set("redenVervolgstap", v)}
          />
        </Section>

        {/* 5. Match met functie */}
        <Section title="5. Match met functie">
          <Textarea
            label=""
            rows={4}
            value={values.matchToelichting}
            onChange={(v) => set("matchToelichting", v)}
          />
        </Section>

        {/* 6. Anekdote */}
        <Section title="6. Anekdote">
          <Textarea
            label=""
            rows={4}
            value={values.anekdote}
            onChange={(v) => set("anekdote", v)}
          />
          <p className="mt-2 text-xs text-tulpiaan-grijs italic">
            Vraag door tot je een specifieke situatie hoort — een klant, een
            actie, een uitkomst.
          </p>
        </Section>

        {/* 7. Haakjes */}
        <Section title="7. Haakjes / netwerk">
          <Textarea
            label=""
            rows={3}
            value={values.haakjes}
            onChange={(v) => set("haakjes", v)}
          />
        </Section>

        {/* 8. Nuance */}
        <Section title="8. Nuance / kanttekening">
          <Textarea
            label=""
            rows={3}
            value={values.nuance}
            onChange={(v) => set("nuance", v)}
          />
        </Section>

        {/* 9. Harde feiten */}
        <Section title="9. Harde feiten">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Input label="Uren" value={values.uren} onChange={(v) => set("uren", v)} />
            <Input label="Salaris" value={values.salaris} onChange={(v) => set("salaris", v)} />
            <Input label="Bonus / lease" value={values.bonusLease} onChange={(v) => set("bonusLease", v)} />
            <Input label="Opzegtermijn" value={values.opzegtermijn} onChange={(v) => set("opzegtermijn", v)} />
            <Input label="Beschikbaarheid" value={values.beschikbaarheid} onChange={(v) => set("beschikbaarheid", v)} />
            <Input label="Hybride / kantoor" value={values.hybride} onChange={(v) => set("hybride", v)} />
          </div>
        </Section>

          </>
        )}

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
          <Link
            href={`/intakes/${intakeId}/voorstel`}
            onClick={() => void flush()}
            className="rounded bg-tulpiaan-goud text-white font-semibold px-4 py-2 hover:bg-tulpiaan-donkergoud transition-colors text-center"
          >
            Genereer voorsteltekst →
          </Link>
          <Link
            href="/intakes"
            onClick={() => void flush()}
            className="text-sm text-tulpiaan-grijs hover:text-tulpiaan-donkergoud sm:ml-auto"
          >
            Pauzeren — ik kom hier later op terug
          </Link>
        </div>
      </div>

      {/* Kladblok mobiel: collapsible bottom-sheet */}
      <div className="lg:hidden">
        {kladblokOpenMobile && (
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setKladblokOpenMobile(false)} />
        )}
        <div
          className={
            "lg:hidden fixed left-0 right-0 bottom-0 z-50 max-h-[80vh] bg-tulpiaan-wit border-t border-tulpiaan-grijs/30 rounded-t-xl shadow-lg transition-transform " +
            (kladblokOpenMobile ? "translate-y-0" : "translate-y-[calc(100%-3rem)]")
          }
        >
          <button
            type="button"
            onClick={() => setKladblokOpenMobile((v) => !v)}
            className="w-full flex items-center justify-between px-4 h-12 border-b border-black/[0.08]"
          >
            <span className="text-sm font-medium text-tulpiaan-zwart">Kladblok</span>
            {kladblokOpenMobile ? (
              <ChevronDown className="h-4 w-4 text-tulpiaan-grijs" />
            ) : (
              <ChevronUp className="h-4 w-4 text-tulpiaan-grijs" />
            )}
          </button>
          <div className="p-4 overflow-y-auto max-h-[calc(80vh-3rem)]">
            <KladblokCard
              value={values.kladblok}
              onChange={(v) => set("kladblok", v)}
              onInsertTime={insertTime}
              textareaRef={kladblokRef}
              status={status}
              errorMsg={errorMsg}
              compact
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function KladblokCard({
  value,
  onChange,
  onInsertTime,
  textareaRef,
  status,
  errorMsg,
  compact,
}: {
  value: string;
  onChange: (v: string) => void;
  onInsertTime: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  status: "idle" | "saving" | "saved" | "error";
  errorMsg: string | null;
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? ""
          : "rounded-lg border border-black/[0.08] bg-tulpiaan-wit p-4"
      }
    >
      {!compact && (
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-sm font-semibold text-tulpiaan-zwart">Kladblok</h2>
            <p className="text-xs text-tulpiaan-grijs">Vrij typen tijdens gesprek</p>
          </div>
          <SaveIndicator status={status} errorMsg={errorMsg} />
        </div>
      )}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={compact ? 10 : 18}
        placeholder="Typ hier alles wat opvalt — anekdotes, opmerkingen, bijzonderheden, citaten van de kandidaat."
        className="w-full min-h-[280px] rounded border border-tulpiaan-grijs/40 bg-tulpiaan-wit px-3 py-2 text-sm text-tulpiaan-zwart focus:outline-none focus:ring-2 focus:ring-tulpiaan-goud resize-none"
      />
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={onInsertTime}
          className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded border border-tulpiaan-grijs/30 text-tulpiaan-zwart hover:border-tulpiaan-goud"
        >
          <Clock className="h-3 w-3" />
          Tijd invoegen
        </button>
        <button
          type="button"
          disabled
          title="AI-verwerking komt later"
          className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded border border-black/[0.08] text-tulpiaan-grijs opacity-60 cursor-not-allowed"
        >
          <Sparkles className="h-3 w-3" />
          Verwerk in vragenlijst
        </button>
      </div>
    </div>
  );
}

function SaveIndicator({
  status,
  errorMsg,
}: {
  status: "idle" | "saving" | "saved" | "error";
  errorMsg: string | null;
}) {
  if (status === "saving") {
    return <span className="text-xs text-tulpiaan-grijs">Bezig met opslaan…</span>;
  }
  if (status === "saved") {
    return <span className="text-xs text-green-700">Opgeslagen ✓</span>;
  }
  if (status === "error") {
    return (
      <span className="text-xs text-red-700" title={errorMsg ?? ""}>
        Opslaan faalde
      </span>
    );
  }
  return <span className="text-xs text-tulpiaan-grijs/60">—</span>;
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-black/[0.08] bg-tulpiaan-wit p-4">
      {children}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors " +
        (active
          ? "border-tulpiaan-goud text-tulpiaan-zwart"
          : "border-transparent text-tulpiaan-grijs hover:text-tulpiaan-zwart")
      }
    >
      {children}
    </button>
  );
}

function Section({
  title,
  cruciaal,
  children,
}: {
  title: string;
  cruciaal?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={
        "rounded-lg border bg-tulpiaan-wit p-4 space-y-3 " +
        (cruciaal
          ? "border-tulpiaan-goud/60 ring-1 ring-tulpiaan-goud/20"
          : "border-black/[0.08]")
      }
    >
      <h2 className="text-base font-semibold text-tulpiaan-zwart flex items-center gap-2">
        {title}
        {cruciaal && (
          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-tulpiaan-goud/20 text-tulpiaan-donkergoud">
            cruciaal
          </span>
        )}
      </h2>
      {children}
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-medium text-tulpiaan-grijs mb-1">
          {label}
        </label>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-tulpiaan-grijs/40 bg-tulpiaan-wit px-3 py-2 text-sm text-tulpiaan-zwart focus:outline-none focus:ring-2 focus:ring-tulpiaan-goud"
      />
    </div>
  );
}

function Textarea({
  label,
  rows,
  value,
  onChange,
}: {
  label: string;
  rows: number;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-medium text-tulpiaan-grijs mb-1">
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-tulpiaan-grijs/40 bg-tulpiaan-wit px-3 py-2 text-sm text-tulpiaan-zwart focus:outline-none focus:ring-2 focus:ring-tulpiaan-goud"
      />
    </div>
  );
}
