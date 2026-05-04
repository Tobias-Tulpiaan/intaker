"use client";

import { useState } from "react";
import { X, Sparkles } from "lucide-react";

export function PasAanModal({
  busy,
  errorMsg,
  onClose,
  onSubmit,
}: {
  busy: boolean;
  errorMsg: string | null;
  onClose: () => void;
  onSubmit: (opmerkingen: string) => void;
}) {
  const [opmerkingen, setOpmerkingen] = useState("");
  const trimmed = opmerkingen.trim();
  const canSubmit = trimmed.length > 0 && !busy;

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit(trimmed);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-tulpiaan-wit w-full sm:max-w-xl sm:rounded-lg max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between gap-3 px-4 sm:px-6 py-4 border-b border-tulpiaan-grijs/20">
          <div>
            <h2 className="text-lg font-semibold text-tulpiaan-zwart">
              Pas tekst aan
            </h2>
            <p className="text-xs text-tulpiaan-grijs mt-0.5">
              Geef AI specifieke instructies om de tekst aan te passen.
              Bijvoorbeeld: &quot;maak alinea 2 korter&quot;, &quot;benoem zijn
              vrijwilligerswerk&quot;, &quot;toon iets warmer&quot;.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Sluiten"
            className="p-1 rounded hover:bg-tulpiaan-ivoor text-tulpiaan-grijs disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3">
          {errorMsg && (
            <div
              role="alert"
              className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800"
            >
              {errorMsg}
            </div>
          )}
          <textarea
            value={opmerkingen}
            onChange={(e) => setOpmerkingen(e.target.value)}
            disabled={busy}
            rows={6}
            placeholder="Typ hier je opmerkingen voor AI..."
            className="w-full min-h-[150px] rounded border border-tulpiaan-grijs/40 bg-tulpiaan-wit px-3 py-2 text-sm text-tulpiaan-zwart focus:outline-none focus:ring-2 focus:ring-tulpiaan-goud disabled:opacity-60"
            autoFocus
          />
        </div>

        <div className="px-4 sm:px-6 py-3 border-t border-tulpiaan-grijs/20 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="text-sm text-tulpiaan-grijs hover:text-tulpiaan-donkergoud disabled:opacity-50"
          >
            Annuleer
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="inline-flex items-center gap-2 rounded bg-tulpiaan-goud text-white font-semibold px-4 py-2 text-sm hover:bg-tulpiaan-donkergoud disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            {busy ? "Verwerken…" : "Verwerk opmerkingen"}
          </button>
        </div>
      </div>
    </div>
  );
}
