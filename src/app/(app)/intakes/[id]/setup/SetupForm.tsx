"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Link as LinkIcon, Globe } from "lucide-react";
import { saveSetupAndGenerate, type SetupFormState } from "./actions";
import { useAutoSave } from "@/components/intake/useAutoSave";

const initialState: SetupFormState = {};

type CandidateOption = {
  id: string;
  firstName: string;
  lastName: string;
};

type Intake = {
  id: string;
  candidateId: string;
  positionTitle: string;
  clientName: string;
  contactpersoon: string;
  afzender: "tobias" | "ralf";
  vacatureTekst: string;
  werkervaringTekst: string;
  bedrijfsUrl: string;
  matchAnalyse: string;
  ankerZin: string;
  verzwijgDit: string;
};

type StrategischeFields = {
  matchAnalyse: string;
  ankerZin: string;
  verzwijgDit: string;
};

export function SetupForm({
  intake,
  candidates,
}: {
  intake: Intake;
  candidates: CandidateOption[];
}) {
  const [state, formAction, pending] = useActionState(
    saveSetupAndGenerate,
    initialState,
  );
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [werkervaringMode, setWerkervaringMode] = useState<"paste" | "url">("paste");

  const {
    values: strat,
    set: setStrat,
    status: stratStatus,
    errorMsg: stratErr,
  } = useAutoSave<StrategischeFields>(
    intake.id,
    {
      matchAnalyse: intake.matchAnalyse,
      ankerZin: intake.ankerZin,
      verzwijgDit: intake.verzwijgDit,
    },
    2000,
  );

  return (
    <>
      {state.error && (
        <div
          role="alert"
          className="mb-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {state.error}
        </div>
      )}

      <form
        action={formAction}
        className="space-y-6 bg-tulpiaan-wit border border-tulpiaan-grijs/20 rounded-lg p-6"
      >
        <input type="hidden" name="intakeId" value={intake.id} />
        <input type="hidden" name="mode" value={mode} />

        {/* Kandidaat */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-tulpiaan-zwart">
              Kandidaat
            </h2>
            <button
              type="button"
              onClick={() => setMode(mode === "existing" ? "new" : "existing")}
              className="text-xs text-tulpiaan-donkergoud hover:underline"
            >
              {mode === "existing" ? "+ Nieuwe kandidaat" : "← Bestaande kiezen"}
            </button>
          </div>

          {mode === "existing" ? (
            <select
              name="candidateId"
              defaultValue={intake.candidateId}
              className="w-full rounded border border-tulpiaan-grijs/40 bg-tulpiaan-wit px-3 py-2 text-tulpiaan-zwart focus:outline-none focus:ring-2 focus:ring-tulpiaan-goud"
            >
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName}
                </option>
              ))}
            </select>
          ) : (
            <div className="space-y-3 rounded border border-tulpiaan-grijs/30 bg-tulpiaan-ivoor/30 p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field name="newFirstName" label="Voornaam *" required />
                <Field name="newLastName" label="Achternaam *" required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field name="newEmail" label="E-mail" type="email" />
                <Field name="newPhone" label="Telefoon" type="tel" />
              </div>
            </div>
          )}
        </section>

        {/* Functie + opdrachtgever */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-tulpiaan-zwart">Functie & opdrachtgever</h2>
          <Field name="positionTitle" label="Functietitel" defaultValue={intake.positionTitle} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field name="clientName" label="Opdrachtgever (bedrijf)" defaultValue={intake.clientName} />
            <Field name="contactpersoon" label="Contactpersoon" defaultValue={intake.contactpersoon} />
          </div>
        </section>

        {/* Afzender */}
        <section>
          <h2 className="text-sm font-semibold text-tulpiaan-zwart mb-2">Afzender</h2>
          <div className="flex gap-3">
            {(["tobias", "ralf"] as const).map((value) => (
              <label
                key={value}
                className="flex-1 flex items-center gap-2 rounded border border-tulpiaan-grijs/40 px-3 py-2 cursor-pointer hover:border-tulpiaan-goud has-[:checked]:border-tulpiaan-goud has-[:checked]:bg-tulpiaan-ivoor"
              >
                <input
                  type="radio"
                  name="afzender"
                  value={value}
                  defaultChecked={intake.afzender === value}
                  className="accent-tulpiaan-goud"
                />
                <span className="text-sm capitalize">{value}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Vacaturetekst */}
        <section>
          <label htmlFor="vacatureTekst" className="block text-sm font-semibold text-tulpiaan-zwart mb-1">
            Vacaturetekst
          </label>
          <textarea
            id="vacatureTekst"
            name="vacatureTekst"
            rows={6}
            defaultValue={intake.vacatureTekst}
            placeholder="Plak hier de vacaturetekst van de opdrachtgever…"
            className="w-full rounded border border-tulpiaan-grijs/40 bg-tulpiaan-wit px-3 py-2 text-sm text-tulpiaan-zwart focus:outline-none focus:ring-2 focus:ring-tulpiaan-goud"
          />
        </section>

        {/* Werkervaring */}
        <section>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-semibold text-tulpiaan-zwart">
              Werkervaring kandidaat
            </label>
            <div className="flex rounded border border-tulpiaan-grijs/30 overflow-hidden text-xs">
              <button
                type="button"
                onClick={() => setWerkervaringMode("paste")}
                className={
                  "px-2 py-1 " +
                  (werkervaringMode === "paste"
                    ? "bg-tulpiaan-goud text-tulpiaan-zwart"
                    : "text-tulpiaan-grijs hover:bg-tulpiaan-ivoor")
                }
              >
                Plakken
              </button>
              <button
                type="button"
                onClick={() => setWerkervaringMode("url")}
                className={
                  "px-2 py-1 " +
                  (werkervaringMode === "url"
                    ? "bg-tulpiaan-goud text-tulpiaan-zwart"
                    : "text-tulpiaan-grijs hover:bg-tulpiaan-ivoor")
                }
                title="LinkedIn-URL fetch komt later"
              >
                LinkedIn-URL
              </button>
            </div>
          </div>
          {werkervaringMode === "paste" ? (
            <textarea
              name="werkervaringTekst"
              rows={6}
              defaultValue={intake.werkervaringTekst}
              placeholder="Plak werkervaring uit CV of LinkedIn-profiel…"
              className="w-full rounded border border-tulpiaan-grijs/40 bg-tulpiaan-wit px-3 py-2 text-sm text-tulpiaan-zwart focus:outline-none focus:ring-2 focus:ring-tulpiaan-goud"
            />
          ) : (
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 rounded border border-tulpiaan-grijs/40 bg-tulpiaan-wit px-3 py-2">
                <LinkIcon className="h-4 w-4 text-tulpiaan-grijs" />
                <input
                  type="url"
                  name="werkervaringTekst"
                  defaultValue={intake.werkervaringTekst}
                  placeholder="https://linkedin.com/in/…"
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                />
              </div>
              <button
                type="button"
                disabled
                className="rounded border border-tulpiaan-grijs/30 px-3 py-2 text-xs text-tulpiaan-grijs opacity-60 cursor-not-allowed"
                title="LinkedIn-fetch komt later"
              >
                Ophalen
              </button>
            </div>
          )}
        </section>

        {/* Bedrijfswebsite */}
        <section>
          <label htmlFor="bedrijfsUrl" className="block text-sm font-semibold text-tulpiaan-zwart mb-1">
            Bedrijfswebsite
          </label>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 rounded border border-tulpiaan-grijs/40 bg-tulpiaan-wit px-3 py-2">
              <Globe className="h-4 w-4 text-tulpiaan-grijs" />
              <input
                id="bedrijfsUrl"
                name="bedrijfsUrl"
                type="url"
                defaultValue={intake.bedrijfsUrl}
                placeholder="https://opdrachtgever.nl"
                className="flex-1 bg-transparent text-sm focus:outline-none"
              />
            </div>
            <button
              type="button"
              disabled
              className="rounded border border-tulpiaan-grijs/30 px-3 py-2 text-xs text-tulpiaan-grijs opacity-60 cursor-not-allowed"
              title="Auto-fetch van bedrijfsTekst komt later"
            >
              Ophalen
            </button>
          </div>
        </section>

        {/* Strategische input voor AI (auto-save) */}
        <section className="border-t border-tulpiaan-grijs/20 pt-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold text-tulpiaan-zwart">
              Strategische input voor AI (optioneel)
            </h2>
            <StratSaveIndicator status={stratStatus} errorMsg={stratErr} />
          </div>
          <p className="text-xs text-tulpiaan-grijs mb-3">
            Drie velden die de AI laten weten wat jij in je hoofd hebt voordat
            je schrijft. Allemaal optioneel — wijzigingen worden automatisch
            opgeslagen.
          </p>

          <input type="hidden" name="matchAnalyse" value={strat.matchAnalyse} />
          <input type="hidden" name="ankerZin" value={strat.ankerZin} />
          <input type="hidden" name="verzwijgDit" value={strat.verzwijgDit} />

          <div className="space-y-4">
            <StratField
              label="Match-analyse"
              hint="Welke vacature-eisen matchen met welke ervaring? Bijv: hunter-mentaliteit in vacature ↔ cold-call campagnes bij ValidSign"
              minHeight={100}
              value={strat.matchAnalyse}
              onChange={(v) => setStrat("matchAnalyse", v)}
            />
            <StratField
              label="Anker-zin (de scheut peper)"
              hint="Dé zin die de tekst draagt. Een quote van de kandidaat, een anekdote, een specifiek haakje. Bijv: 'Hij gebruikte zelf de woorden ondernemer van je eigen winkel'"
              minHeight={80}
              value={strat.ankerZin}
              onChange={(v) => setStrat("ankerZin", v)}
            />
            <StratField
              label="Wat verzwijg je bewust"
              hint="Dingen die jij weet maar bewust niet vooraf wilt noemen. Wrijvingspunt-info, gevoelige details, gespreksruimte voor het kennismakingsgesprek. Bijv: 'Vrijdagmiddag-vrij niet noemen, gezien hun vrijdaglunch'"
              minHeight={80}
              value={strat.verzwijgDit}
              onChange={(v) => setStrat("verzwijgDit", v)}
            />
          </div>
        </section>

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded bg-tulpiaan-goud text-white font-semibold px-4 py-2 hover:bg-tulpiaan-donkergoud disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {pending ? "Genereren…" : "Genereer gespreksvragen →"}
          </button>
          <Link
            href="/intakes"
            className="text-sm text-tulpiaan-grijs hover:text-tulpiaan-donkergoud"
          >
            Later afmaken
          </Link>
        </div>
      </form>
    </>
  );
}

function Field({
  name,
  label,
  type = "text",
  defaultValue,
  required,
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-tulpiaan-zwart mb-1">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="w-full rounded border border-tulpiaan-grijs/40 bg-tulpiaan-wit px-3 py-2 text-tulpiaan-zwart focus:outline-none focus:ring-2 focus:ring-tulpiaan-goud"
      />
    </div>
  );
}

function StratField({
  label,
  hint,
  minHeight,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  minHeight: number;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-tulpiaan-zwart">
        {label}
      </label>
      <p className="text-xs text-tulpiaan-grijs mb-1">{hint}</p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ minHeight: `${minHeight}px` }}
        className="w-full rounded border border-tulpiaan-grijs/40 bg-tulpiaan-wit px-3 py-2 text-sm text-tulpiaan-zwart focus:outline-none focus:ring-2 focus:ring-tulpiaan-goud"
      />
    </div>
  );
}

function StratSaveIndicator({
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
