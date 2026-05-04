"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardCopy,
  FileText,
  FileType,
  Sparkles,
  Send,
  Check,
  SpellCheck,
  Wand2,
  Dice5,
  MessageSquareText,
} from "lucide-react";
import { useAutoSave } from "@/components/intake/useAutoSave";
import {
  genereerVoorstel,
  markeerVerstuurd,
  kiesVoorstelVersie,
} from "./actions";
import { TrackChangesModal } from "./TrackChangesModal";
import { PasAanModal } from "./PasAanModal";
import type { Suggestie } from "@/lib/intake-ai";

type Fields = {
  voorstelTekst: string;
};

type ModalKind = "check" | "verbeter" | "pasaan";

export function VoorstelWorkspace({
  intakeId,
  initialTekst,
  initialTekstV2,
  kandidaatNaam,
  handtekening,
  status,
  gegenereerdOp,
}: {
  intakeId: string;
  initialTekst: string;
  initialTekstV2: string | null;
  kandidaatNaam: string;
  handtekening: string;
  status: string;
  gegenereerdOp: string | null;
}) {
  const router = useRouter();
  const { values, set, status: saveStatus, errorMsg, flush } = useAutoSave<Fields>(
    intakeId,
    { voorstelTekst: initialTekst },
    2000,
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [generatePending, setGeneratePending] = useState(false);
  const [aiBusy, setAiBusy] = useState<
    null | "check" | "verbeter" | "regenerate" | "pasaan"
  >(null);
  const [pasAanOpen, setPasAanOpen] = useState(false);
  const [pasAanError, setPasAanError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [sentNotice, setSentNotice] = useState(status === "verstuurd");
  const [generatedAt, setGeneratedAt] = useState<string | null>(gegenereerdOp);

  const [modalKind, setModalKind] = useState<ModalKind | null>(null);
  const [modalSuggesties, setModalSuggesties] = useState<Suggestie[]>([]);

  const tekst = values.voorstelTekst;
  const heeftTekst = tekst.trim().length > 0;
  const heeftV2 = initialTekstV2 !== null && initialTekstV2.trim().length > 0;

  function genereer() {
    setError(null);
    setGeneratePending(true);
    startTransition(async () => {
      const r = await genereerVoorstel(intakeId);
      if (r.ok) {
        set("voorstelTekst", r.tekst);
        setGeneratedAt(new Date().toISOString());
      } else {
        setError(r.error);
      }
      setGeneratePending(false);
    });
  }

  async function runCheck() {
    if (!heeftTekst) return;
    setError(null);
    setAiBusy("check");
    await flush();
    try {
      const res = await fetch(`/api/intakes/${intakeId}/check-tekst`, {
        method: "POST",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const data = (await res.json()) as { suggesties: Suggestie[] };
      setModalSuggesties(data.suggesties);
      setModalKind("check");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Check faalde");
    } finally {
      setAiBusy(null);
    }
  }

  async function runVerbeter() {
    if (!heeftTekst) return;
    setError(null);
    setAiBusy("verbeter");
    await flush();
    try {
      const res = await fetch(`/api/intakes/${intakeId}/verbeter-tekst`, {
        method: "POST",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const data = (await res.json()) as { suggesties: Suggestie[] };
      setModalSuggesties(data.suggesties);
      setModalKind("verbeter");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verbeteren faalde");
    } finally {
      setAiBusy(null);
    }
  }

  function openPasAan() {
    if (!heeftTekst) return;
    setPasAanError(null);
    setPasAanOpen(true);
  }

  async function submitPasAan(opmerkingen: string) {
    setPasAanError(null);
    setError(null);
    setAiBusy("pasaan");
    await flush();
    try {
      const res = await fetch(`/api/intakes/${intakeId}/pas-aan-tekst`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opmerkingen }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const data = (await res.json()) as { suggesties: Suggestie[] };
      setPasAanOpen(false);
      setModalSuggesties(data.suggesties);
      setModalKind("pasaan");
    } catch (e) {
      setPasAanError(e instanceof Error ? e.message : "Aanpassen faalde");
    } finally {
      setAiBusy(null);
    }
  }

  async function runRegenerate() {
    if (!heeftTekst) return;
    setError(null);
    setAiBusy("regenerate");
    await flush();
    try {
      const res = await fetch(
        `/api/intakes/${intakeId}/genereer-voorstel?regenerate=true`,
        { method: "POST" },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Regenereren faalde");
    } finally {
      setAiBusy(null);
    }
  }

  function applySuggesties(toAccept: Suggestie[]) {
    let next = tekst;
    for (const s of toAccept) {
      const idx = next.indexOf(s.origineel);
      if (idx !== -1) {
        next =
          next.slice(0, idx) + s.voorgesteld + next.slice(idx + s.origineel.length);
      }
    }
    if (next !== tekst) set("voorstelTekst", next);
    setModalKind(null);
    setModalSuggesties([]);
  }

  function kiesVersie(versie: 1 | 2) {
    setError(null);
    startTransition(async () => {
      const r = await kiesVoorstelVersie(intakeId, versie);
      if (r.ok) {
        router.refresh();
      } else {
        setError(r.error);
      }
    });
  }

  function fullText() {
    return tekst.trimEnd() + "\n\n" + handtekening;
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(fullText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Klembord niet beschikbaar");
    }
  }

  async function downloadWord() {
    setError(null);
    try {
      const { exportToWord } = await import("@/lib/exports");
      await exportToWord(fullText(), kandidaatNaam);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Word-export faalde");
    }
  }

  async function downloadPdf() {
    setError(null);
    try {
      const { exportToPdf } = await import("@/lib/exports");
      await exportToPdf(fullText(), kandidaatNaam);
    } catch (e) {
      setError(e instanceof Error ? e.message : "PDF-export faalde");
    }
  }

  function markVerstuurd() {
    startTransition(async () => {
      const r = await markeerVerstuurd(intakeId);
      if (r.ok) setSentNotice(true);
      else setError(r.error);
    });
  }

  // 2-version mode wins from edit-mode: user must first kies een versie
  if (heeftV2) {
    return (
      <div className="space-y-4">
        {error && (
          <div role="alert" className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        )}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Er zijn twee versies. Kies welke je wilt behouden — de andere wordt verwijderd.
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <VersieKolom
            label="Versie 1 (origineel)"
            tekst={initialTekst}
            onKies={() => kiesVersie(1)}
            disabled={pending}
          />
          <VersieKolom
            label="Versie 2 (regenereerd)"
            tekst={initialTekstV2 ?? ""}
            onKies={() => kiesVersie(2)}
            disabled={pending}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div role="alert" className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      {!heeftTekst ? (
        <div className="rounded-lg border border-tulpiaan-grijs/30 bg-tulpiaan-wit p-8 text-center">
          <p className="text-sm text-tulpiaan-grijs mb-4">
            Nog geen voorsteltekst. Klik om een eerste versie te genereren op
            basis van alles wat je tijdens de intake hebt vastgelegd.
          </p>
          <button
            type="button"
            onClick={genereer}
            disabled={generatePending}
            className="inline-flex items-center gap-2 rounded bg-tulpiaan-goud text-white font-semibold px-5 py-2.5 hover:bg-tulpiaan-donkergoud disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            {generatePending ? "Genereren…" : "Genereer voorstel"}
          </button>
        </div>
      ) : (
        <div className="lg:flex lg:gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-tulpiaan-zwart">Voorsteltekst</h2>
              <SaveIndicator status={saveStatus} errorMsg={errorMsg} />
            </div>
            <textarea
              value={tekst}
              onChange={(e) => set("voorstelTekst", e.target.value)}
              rows={22}
              className="w-full rounded border border-tulpiaan-grijs/40 bg-tulpiaan-wit px-3 py-3 text-sm text-tulpiaan-zwart focus:outline-none focus:ring-2 focus:ring-tulpiaan-goud font-serif leading-relaxed"
            />

            <div className="mt-3 pt-3 border-t border-tulpiaan-grijs/20">
              <div className="text-[11px] uppercase tracking-wider text-tulpiaan-grijs mb-1">
                Handtekening (wordt automatisch toegevoegd bij export)
              </div>
              <pre className="text-xs whitespace-pre-wrap font-sans text-tulpiaan-zwart">
{handtekening}
              </pre>
            </div>

            {generatedAt && (
              <p className="mt-2 text-xs text-tulpiaan-grijs">
                Laatst gegenereerd:{" "}
                {new Intl.DateTimeFormat("nl-NL", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(generatedAt))}
              </p>
            )}
          </div>

          <aside className="lg:w-[220px] shrink-0 mt-4 lg:mt-0">
            <h3 className="text-xs uppercase tracking-wider text-tulpiaan-grijs mb-2">
              AI-modi
            </h3>
            <div className="space-y-2">
              <ActionButton
                icon={SpellCheck}
                label="Check spelling en grammatica"
                onClick={runCheck}
                busy={aiBusy === "check"}
                disabled={aiBusy !== null}
              />
              <ActionButton
                icon={Wand2}
                label="Verbeter (spelling + stijl)"
                onClick={runVerbeter}
                busy={aiBusy === "verbeter"}
                disabled={aiBusy !== null}
              />
              <ActionButton
                icon={Dice5}
                label="Genereer totaal opnieuw"
                onClick={runRegenerate}
                busy={aiBusy === "regenerate"}
                disabled={aiBusy !== null}
              />
              <ActionButton
                icon={MessageSquareText}
                label="Pas aan op basis van opmerkingen"
                onClick={openPasAan}
                busy={aiBusy === "pasaan"}
                disabled={aiBusy !== null}
              />
            </div>
          </aside>
        </div>
      )}

      {heeftTekst && (
        <>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={copyToClipboard}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded border border-tulpiaan-grijs/40 bg-tulpiaan-wit px-4 py-2 text-sm hover:border-tulpiaan-goud"
            >
              {copied ? <Check className="h-4 w-4 text-green-700" /> : <ClipboardCopy className="h-4 w-4" />}
              {copied ? "Gekopieerd" : "Klembord"}
            </button>
            <button
              type="button"
              onClick={downloadWord}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded border border-tulpiaan-grijs/40 bg-tulpiaan-wit px-4 py-2 text-sm hover:border-tulpiaan-goud"
            >
              <FileText className="h-4 w-4" />
              Word
            </button>
            <button
              type="button"
              onClick={downloadPdf}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded border border-tulpiaan-grijs/40 bg-tulpiaan-wit px-4 py-2 text-sm hover:border-tulpiaan-goud"
            >
              <FileType className="h-4 w-4" />
              PDF
            </button>
          </div>

          <div className="pt-2 border-t border-tulpiaan-grijs/20">
            {sentNotice ? (
              <div className="inline-flex items-center gap-2 text-sm text-green-800 bg-green-50 border border-green-200 rounded px-3 py-2">
                <Check className="h-4 w-4" />
                Gemarkeerd als verstuurd
              </div>
            ) : (
              <button
                type="button"
                onClick={markVerstuurd}
                disabled={pending}
                className="inline-flex items-center gap-2 rounded border border-tulpiaan-grijs/40 px-4 py-2 text-sm text-tulpiaan-zwart hover:border-tulpiaan-goud disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                Markeer als verstuurd
              </button>
            )}
          </div>
        </>
      )}

      {modalKind && (
        <TrackChangesModal
          titel={
            modalKind === "check"
              ? "Spelling- en grammatica-suggesties"
              : modalKind === "verbeter"
              ? "Tulpiaan-stijl-suggesties"
              : "Aanpassingen op basis van jouw opmerkingen"
          }
          suggesties={modalSuggesties}
          onClose={() => {
            setModalKind(null);
            setModalSuggesties([]);
          }}
          onApply={applySuggesties}
        />
      )}

      {pasAanOpen && (
        <PasAanModal
          busy={aiBusy === "pasaan"}
          errorMsg={pasAanError}
          onClose={() => {
            if (aiBusy === "pasaan") return;
            setPasAanOpen(false);
            setPasAanError(null);
          }}
          onSubmit={submitPasAan}
        />
      )}
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  busy,
  disabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  busy: boolean;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-2 rounded border border-tulpiaan-grijs/40 bg-tulpiaan-wit px-3 py-2 text-xs text-tulpiaan-zwart hover:border-tulpiaan-goud disabled:opacity-50 disabled:cursor-wait transition-colors"
    >
      <Icon className="h-3.5 w-3.5 shrink-0 text-tulpiaan-donkergoud" />
      <span className="text-left flex-1">{label}</span>
      {busy && (
        <span className="h-3 w-3 rounded-full border-2 border-tulpiaan-goud border-t-transparent animate-spin shrink-0" />
      )}
    </button>
  );
}

function VersieKolom({
  label,
  tekst,
  onKies,
  disabled,
}: {
  label: string;
  tekst: string;
  onKies: () => void;
  disabled: boolean;
}) {
  return (
    <div className="rounded-lg border border-tulpiaan-grijs/30 bg-tulpiaan-wit p-3 flex flex-col">
      <div className="text-xs uppercase tracking-wider text-tulpiaan-grijs mb-2">
        {label}
      </div>
      <pre className="flex-1 text-xs whitespace-pre-wrap font-serif text-tulpiaan-zwart leading-relaxed max-h-[60vh] overflow-y-auto bg-tulpiaan-ivoor/30 rounded p-3 border border-tulpiaan-grijs/20">
{tekst}
      </pre>
      <button
        type="button"
        onClick={onKies}
        disabled={disabled}
        className="mt-3 rounded bg-tulpiaan-goud text-white font-semibold px-4 py-2 text-sm hover:bg-tulpiaan-donkergoud disabled:opacity-50"
      >
        ✓ Behoud deze versie
      </button>
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
