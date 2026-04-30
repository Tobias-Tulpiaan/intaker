"use client";

import { useState, useTransition } from "react";
import {
  ClipboardCopy,
  FileText,
  FileType,
  Sparkles,
  Send,
  Check,
} from "lucide-react";
import {
  genereerVoorstel,
  saveVoorstelTekst,
  markeerVerstuurd,
} from "./actions";

type Stijl = "recht" | "warm" | "pareltje" | "zorgvuldig";

const STIJLEN: { key: Stijl; titel: string; beschrijving: string }[] = [
  { key: "recht", titel: "Recht door zee", beschrijving: "Kort, krachtig, geen omhaal" },
  { key: "warm", titel: "Warm verhaal", beschrijving: "Uitgebreid, persoonlijk, met anekdote" },
  { key: "pareltje", titel: "Pareltje gevonden", beschrijving: "Enthousiast, urgentie, uniciteit" },
  { key: "zorgvuldig", titel: "Zorgvuldig & onderbouwd", beschrijving: "Formeel, gestructureerd, met nuance" },
];

export function VoorstelWorkspace({
  intakeId,
  initialStijl,
  initialTekst,
  kandidaatNaam,
  handtekening,
  status,
  gegenereerdOp,
}: {
  intakeId: string;
  initialStijl: Stijl | null;
  initialTekst: string;
  kandidaatNaam: string;
  handtekening: string;
  status: string;
  gegenereerdOp: string | null;
}) {
  const [stijl, setStijl] = useState<Stijl | null>(initialStijl);
  const [tekst, setTekst] = useState<string>(initialTekst);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [sentNotice, setSentNotice] = useState(status === "verstuurd");

  function genereer() {
    if (!stijl) return;
    setError(null);
    startTransition(async () => {
      const r = await genereerVoorstel(intakeId, stijl);
      if (r.ok) {
        setTekst(r.tekst);
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

  function saveTekst() {
    setError(null);
    startTransition(async () => {
      const r = await saveVoorstelTekst(intakeId, tekst);
      if (r.ok) {
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 2000);
      } else {
        setError(r.error);
      }
    });
  }

  function markVerstuurd() {
    startTransition(async () => {
      const r = await markeerVerstuurd(intakeId);
      if (r.ok) setSentNotice(true);
      else setError(r.error);
    });
  }

  return (
    <div className="space-y-6">
      {error && (
        <div role="alert" className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-tulpiaan-zwart mb-2">Stijl</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {STIJLEN.map((s) => {
            const active = stijl === s.key;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setStijl(s.key)}
                className={
                  "text-left p-4 rounded-lg border transition-colors " +
                  (active
                    ? "border-tulpiaan-goud bg-tulpiaan-ivoor ring-1 ring-tulpiaan-goud"
                    : "border-tulpiaan-grijs/30 bg-tulpiaan-wit hover:border-tulpiaan-goud")
                }
              >
                <div className="font-semibold text-tulpiaan-zwart">{s.titel}</div>
                <div className="text-xs text-tulpiaan-grijs mt-1">{s.beschrijving}</div>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={genereer}
          disabled={!stijl || pending}
          className="mt-3 inline-flex items-center gap-2 rounded bg-tulpiaan-goud text-tulpiaan-zwart font-medium px-4 py-2 hover:bg-tulpiaan-donkergoud disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          {pending ? "Genereren…" : "Genereer voorsteltekst"}
        </button>
        {gegenereerdOp && (
          <span className="ml-3 text-xs text-tulpiaan-grijs">
            Laatst gegenereerd:{" "}
            {new Intl.DateTimeFormat("nl-NL", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date(gegenereerdOp))}
          </span>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-tulpiaan-zwart">Voorsteltekst</h2>
          {savedNotice && <span className="text-xs text-green-700">Opgeslagen ✓</span>}
        </div>
        <textarea
          value={tekst}
          onChange={(e) => setTekst(e.target.value)}
          onBlur={saveTekst}
          rows={20}
          placeholder="Klik 'Genereer voorsteltekst' of typ hier zelf je tekst…"
          className="w-full rounded border border-tulpiaan-grijs/40 bg-tulpiaan-wit px-3 py-3 text-sm text-tulpiaan-zwart focus:outline-none focus:ring-2 focus:ring-tulpiaan-goud font-serif leading-relaxed"
        />
        <details className="mt-2">
          <summary className="text-xs text-tulpiaan-grijs cursor-pointer hover:text-tulpiaan-zwart">
            Voorbeeld met handtekening
          </summary>
          <pre className="mt-2 p-3 bg-tulpiaan-ivoor border border-tulpiaan-grijs/20 rounded text-xs whitespace-pre-wrap font-sans">
{handtekening}
          </pre>
        </details>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={copyToClipboard}
          disabled={!tekst}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded border border-tulpiaan-grijs/40 bg-tulpiaan-wit px-4 py-2 text-sm hover:border-tulpiaan-goud disabled:opacity-50"
        >
          {copied ? <Check className="h-4 w-4 text-green-700" /> : <ClipboardCopy className="h-4 w-4" />}
          {copied ? "Gekopieerd" : "Klembord"}
        </button>
        <button
          type="button"
          onClick={downloadWord}
          disabled={!tekst}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded border border-tulpiaan-grijs/40 bg-tulpiaan-wit px-4 py-2 text-sm hover:border-tulpiaan-goud disabled:opacity-50"
        >
          <FileText className="h-4 w-4" />
          Word
        </button>
        <button
          type="button"
          onClick={downloadPdf}
          disabled={!tekst}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded border border-tulpiaan-grijs/40 bg-tulpiaan-wit px-4 py-2 text-sm hover:border-tulpiaan-goud disabled:opacity-50"
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
            disabled={!tekst || pending}
            className="inline-flex items-center gap-2 rounded border border-tulpiaan-grijs/40 px-4 py-2 text-sm text-tulpiaan-zwart hover:border-tulpiaan-goud disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            Markeer als verstuurd
          </button>
        )}
      </div>
    </div>
  );
}
