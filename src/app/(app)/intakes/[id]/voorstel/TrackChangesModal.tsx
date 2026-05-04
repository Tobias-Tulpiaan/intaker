"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import type { Suggestie, SuggestieType } from "@/lib/intake-ai";

const TYPE_LABELS: Record<SuggestieType, string> = {
  spelling: "Spelling",
  grammatica: "Grammatica",
  stijl: "Stijl",
  interpunctie: "Interpunctie",
};

const TYPE_COLORS: Record<SuggestieType, string> = {
  spelling: "bg-blue-100 text-blue-900",
  grammatica: "bg-purple-100 text-purple-900",
  stijl: "bg-amber-100 text-amber-900",
  interpunctie: "bg-pink-100 text-pink-900",
};

export type Verwerking = "pending" | "accepted" | "ignored";

export function TrackChangesModal({
  titel,
  suggesties,
  onClose,
  onApply,
}: {
  titel: string;
  suggesties: Suggestie[];
  onClose: () => void;
  onApply: (toAccept: Suggestie[]) => void;
}) {
  const [staat, setStaat] = useState<Record<string, Verwerking>>({});

  const verwerkt = Object.values(staat).filter((s) => s !== "pending").length;
  const totaal = suggesties.length;

  function decide(id: string, keuze: "accepted" | "ignored") {
    setStaat((prev) => ({ ...prev, [id]: keuze }));
  }

  function accepteerAlles() {
    const next: Record<string, Verwerking> = {};
    for (const s of suggesties) next[s.id] = "accepted";
    setStaat(next);
  }
  function negeerAlles() {
    const next: Record<string, Verwerking> = {};
    for (const s of suggesties) next[s.id] = "ignored";
    setStaat(next);
  }

  function klaar() {
    const accepted = suggesties.filter((s) => staat[s.id] === "accepted");
    onApply(accepted);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-tulpiaan-wit w-full sm:max-w-2xl sm:rounded-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-4 sm:px-6 py-4 border-b border-tulpiaan-grijs/20">
          <div>
            <h2 className="text-lg font-semibold text-tulpiaan-zwart">{titel}</h2>
            <p className="text-xs text-tulpiaan-grijs mt-0.5">
              {totaal === 0
                ? "Geen suggesties — de tekst ziet er goed uit."
                : `${verwerkt} van ${totaal} verwerkt`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Sluiten"
            className="p-1 rounded hover:bg-tulpiaan-ivoor text-tulpiaan-grijs"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Bulk-acties */}
        {totaal > 0 && (
          <div className="px-4 sm:px-6 py-2 border-b border-tulpiaan-grijs/10 flex gap-2 text-xs">
            <button
              type="button"
              onClick={accepteerAlles}
              className="text-tulpiaan-donkergoud hover:underline"
            >
              Accepteer alles
            </button>
            <span className="text-tulpiaan-grijs/40">·</span>
            <button
              type="button"
              onClick={negeerAlles}
              className="text-tulpiaan-grijs hover:underline"
            >
              Negeer alles
            </button>
          </div>
        )}

        {/* Suggesties-lijst */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 space-y-3">
          {suggesties.length === 0 ? (
            <div className="text-center py-8 text-sm text-tulpiaan-grijs">
              De tekst is volgens de AI in orde.
            </div>
          ) : (
            suggesties.map((s) => {
              const v = staat[s.id] ?? "pending";
              return (
                <div
                  key={s.id}
                  className={
                    "rounded-lg border p-3 " +
                    (v === "accepted"
                      ? "border-green-300 bg-green-50/50"
                      : v === "ignored"
                      ? "border-tulpiaan-grijs/20 bg-tulpiaan-ivoor/40 opacity-60"
                      : "border-tulpiaan-grijs/30 bg-tulpiaan-wit")
                  }
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={
                        "inline-block text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded " +
                        TYPE_COLORS[s.type]
                      }
                    >
                      {TYPE_LABELS[s.type]}
                    </span>
                    {v === "accepted" && (
                      <span className="text-[10px] text-green-800 font-medium">
                        Geaccepteerd
                      </span>
                    )}
                    {v === "ignored" && (
                      <span className="text-[10px] text-tulpiaan-grijs font-medium">
                        Genegeerd
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-sm">
                    <div className="rounded bg-red-50 border border-red-200 px-2 py-1.5 text-red-900 line-through">
                      {s.origineel}
                    </div>
                    <div className="rounded bg-green-50 border border-green-200 px-2 py-1.5 text-green-900">
                      {s.voorgesteld}
                    </div>
                  </div>

                  {s.uitleg && (
                    <p className="text-xs text-tulpiaan-grijs mt-2">{s.uitleg}</p>
                  )}

                  {v === "pending" && (
                    <div className="flex gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => decide(s.id, "accepted")}
                        className="inline-flex items-center gap-1 rounded bg-green-100 text-green-900 hover:bg-green-200 px-3 py-1 text-xs font-medium"
                      >
                        <Check className="h-3 w-3" />
                        Accepteer
                      </button>
                      <button
                        type="button"
                        onClick={() => decide(s.id, "ignored")}
                        className="inline-flex items-center gap-1 rounded border border-tulpiaan-grijs/30 px-3 py-1 text-xs text-tulpiaan-grijs hover:border-tulpiaan-grijs"
                      >
                        <X className="h-3 w-3" />
                        Negeer
                      </button>
                    </div>
                  )}
                  {v !== "pending" && (
                    <button
                      type="button"
                      onClick={() =>
                        setStaat((prev) => {
                          const next = { ...prev };
                          delete next[s.id];
                          return next;
                        })
                      }
                      className="mt-2 text-xs text-tulpiaan-grijs hover:text-tulpiaan-donkergoud"
                    >
                      Ongedaan maken
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-tulpiaan-grijs/20 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-tulpiaan-grijs hover:text-tulpiaan-donkergoud"
          >
            Annuleren
          </button>
          <button
            type="button"
            onClick={klaar}
            className="rounded bg-tulpiaan-goud text-white font-semibold px-4 py-2 text-sm hover:bg-tulpiaan-donkergoud"
          >
            Klaar
          </button>
        </div>
      </div>
    </div>
  );
}
