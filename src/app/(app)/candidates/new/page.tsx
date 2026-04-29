"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createCandidate, type CandidateFormState } from "../actions";

const initialState: CandidateFormState = {};

export default function NewCandidatePage() {
  const [state, formAction, pending] = useActionState(createCandidate, initialState);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href="/candidates"
          className="text-sm text-tulpiaan-grijs hover:text-tulpiaan-donkergoud"
        >
          ← Terug naar kandidaten
        </Link>
        <h1 className="text-2xl font-semibold text-tulpiaan-zwart mt-2">
          Nieuwe kandidaat
        </h1>
      </div>

      {state.error && (
        <div
          role="alert"
          className="mb-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4 bg-tulpiaan-wit border border-tulpiaan-grijs/20 rounded-lg p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Voornaam *" name="firstName" required />
          <Field label="Achternaam *" name="lastName" required />
        </div>

        <Field label="E-mail" name="email" type="email" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Telefoon" name="phone" type="tel" placeholder="+31 6 …" />
          <Field label="Woonplaats" name="city" />
        </div>

        <Field label="LinkedIn-URL" name="linkedinUrl" type="url" placeholder="https://linkedin.com/in/…" />

        <div>
          <label className="block text-sm font-medium text-tulpiaan-zwart mb-1">
            Notities
          </label>
          <textarea
            name="notes"
            rows={4}
            className="w-full rounded border border-tulpiaan-grijs/40 bg-tulpiaan-wit px-3 py-2 text-tulpiaan-zwart focus:outline-none focus:ring-2 focus:ring-tulpiaan-goud"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded bg-tulpiaan-goud text-tulpiaan-zwart font-medium px-4 py-2 hover:bg-tulpiaan-donkergoud disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {pending ? "Bezig…" : "Opslaan"}
          </button>
          <Link
            href="/candidates"
            className="text-sm text-tulpiaan-grijs hover:text-tulpiaan-donkergoud"
          >
            Annuleren
          </Link>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-tulpiaan-zwart mb-1"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded border border-tulpiaan-grijs/40 bg-tulpiaan-wit px-3 py-2 text-tulpiaan-zwart focus:outline-none focus:ring-2 focus:ring-tulpiaan-goud"
      />
    </div>
  );
}
