"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createIntake, type IntakeFormState } from "../actions";

const initialState: IntakeFormState = {};

type CandidateOption = {
  id: string;
  firstName: string;
  lastName: string;
};

export function NewIntakeForm({
  candidates,
  defaultCandidateId,
}: {
  candidates: CandidateOption[];
  defaultCandidateId?: string;
}) {
  const [state, formAction, pending] = useActionState(createIntake, initialState);

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
        className="space-y-4 bg-tulpiaan-wit border border-tulpiaan-grijs/20 rounded-lg p-6"
      >
        <div>
          <label
            htmlFor="candidateId"
            className="block text-sm font-medium text-tulpiaan-zwart mb-1"
          >
            Kandidaat *
          </label>
          <select
            id="candidateId"
            name="candidateId"
            defaultValue={defaultCandidateId ?? ""}
            required
            className="w-full rounded border border-tulpiaan-grijs/40 bg-tulpiaan-wit px-3 py-2 text-tulpiaan-zwart focus:outline-none focus:ring-2 focus:ring-tulpiaan-goud"
          >
            <option value="" disabled>
              Kies een kandidaat…
            </option>
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="positionTitle"
            className="block text-sm font-medium text-tulpiaan-zwart mb-1"
          >
            Functie
          </label>
          <input
            id="positionTitle"
            name="positionTitle"
            type="text"
            placeholder="bv. Senior Developer"
            className="w-full rounded border border-tulpiaan-grijs/40 bg-tulpiaan-wit px-3 py-2 text-tulpiaan-zwart focus:outline-none focus:ring-2 focus:ring-tulpiaan-goud"
          />
        </div>

        <div>
          <label
            htmlFor="clientName"
            className="block text-sm font-medium text-tulpiaan-zwart mb-1"
          >
            Opdrachtgever
          </label>
          <input
            id="clientName"
            name="clientName"
            type="text"
            placeholder="bv. Acme B.V."
            className="w-full rounded border border-tulpiaan-grijs/40 bg-tulpiaan-wit px-3 py-2 text-tulpiaan-zwart focus:outline-none focus:ring-2 focus:ring-tulpiaan-goud"
          />
        </div>

        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-tulpiaan-zwart mb-1"
          >
            Notities / eerste indruk
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={5}
            placeholder="Aantekeningen tijdens of na het telefoongesprek…"
            className="w-full rounded border border-tulpiaan-grijs/40 bg-tulpiaan-wit px-3 py-2 text-tulpiaan-zwart focus:outline-none focus:ring-2 focus:ring-tulpiaan-goud"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded bg-tulpiaan-goud text-tulpiaan-zwart font-medium px-4 py-2 hover:bg-tulpiaan-donkergoud disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {pending ? "Bezig…" : "Intake aanmaken"}
          </button>
          <Link
            href="/intakes"
            className="text-sm text-tulpiaan-grijs hover:text-tulpiaan-donkergoud"
          >
            Annuleren
          </Link>
        </div>
      </form>
    </>
  );
}
