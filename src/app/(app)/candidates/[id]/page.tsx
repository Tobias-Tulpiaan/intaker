import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("nl-NL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export default async function CandidatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const candidate = await prisma.candidate.findUnique({
    where: { id },
    include: {
      intakes: {
        orderBy: { intakeDate: "desc" },
        include: { recruiter: { select: { name: true, email: true } } },
      },
    },
  });

  if (!candidate) notFound();

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link
          href="/candidates"
          className="text-sm text-tulpiaan-grijs hover:text-tulpiaan-donkergoud"
        >
          ← Terug naar kandidaten
        </Link>
        <h1 className="text-2xl font-semibold text-tulpiaan-zwart mt-2">
          {candidate.firstName} {candidate.lastName}
        </h1>
      </div>

      <div className="bg-tulpiaan-wit border border-tulpiaan-grijs/20 rounded-lg p-6 mb-6">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <Row label="E-mail" value={candidate.email} />
          <Row label="Telefoon" value={candidate.phone} />
          <Row label="Woonplaats" value={candidate.city} />
          <Row
            label="LinkedIn"
            value={
              candidate.linkedinUrl ? (
                <a
                  href={candidate.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-tulpiaan-donkergoud hover:underline"
                >
                  Profiel openen
                </a>
              ) : null
            }
          />
        </dl>
        {candidate.notes && (
          <div className="mt-4 pt-4 border-t border-tulpiaan-grijs/20">
            <div className="text-xs uppercase tracking-wide text-tulpiaan-grijs mb-1">
              Notities
            </div>
            <p className="text-sm whitespace-pre-wrap text-tulpiaan-zwart">
              {candidate.notes}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-tulpiaan-zwart">Intakes</h2>
        <Link
          href={`/intakes/new?candidateId=${candidate.id}`}
          className="inline-flex items-center gap-2 rounded bg-tulpiaan-goud text-tulpiaan-zwart text-sm font-medium px-3 py-1.5 hover:bg-tulpiaan-donkergoud transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nieuwe intake
        </Link>
      </div>

      {candidate.intakes.length === 0 ? (
        <div className="rounded border border-dashed border-tulpiaan-grijs/40 bg-tulpiaan-wit p-6 text-center text-sm text-tulpiaan-grijs">
          Nog geen intakes voor deze kandidaat.
        </div>
      ) : (
        <ul className="space-y-2">
          {candidate.intakes.map((intake) => (
            <li
              key={intake.id}
              className="bg-tulpiaan-wit border border-tulpiaan-grijs/20 rounded-lg p-4 hover:border-tulpiaan-goud transition-colors"
            >
              <Link href={`/intakes/${intake.id}`} className="block">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-tulpiaan-zwart">
                      {intake.positionTitle ?? "Intake"}
                      {intake.clientName ? ` — ${intake.clientName}` : ""}
                    </div>
                    <div className="text-xs text-tulpiaan-grijs mt-1">
                      {formatDate(intake.intakeDate)} · door{" "}
                      {intake.recruiter.name ?? intake.recruiter.email}
                    </div>
                  </div>
                  <StatusPill status={intake.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <>
      <dt className="text-tulpiaan-grijs">{label}</dt>
      <dd className="text-tulpiaan-zwart">{value || "—"}</dd>
    </>
  );
}

function StatusPill({ status }: { status: string }) {
  const isCompleted = status === "completed";
  return (
    <span
      className={
        "inline-flex text-xs px-2 py-1 rounded-full " +
        (isCompleted
          ? "bg-green-100 text-green-800"
          : "bg-tulpiaan-ivoor text-tulpiaan-grijs border border-tulpiaan-grijs/30")
      }
    >
      {isCompleted ? "Afgerond" : "Concept"}
    </span>
  );
}
