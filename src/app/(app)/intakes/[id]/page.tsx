import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { markIntakeCompleted } from "../actions";

export const dynamic = "force-dynamic";

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("nl-NL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default async function IntakePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const intake = await prisma.intake.findUnique({
    where: { id },
    include: {
      candidate: true,
      recruiter: { select: { name: true, email: true } },
    },
  });

  if (!intake) notFound();

  const isCompleted = intake.status === "completed";

  async function complete() {
    "use server";
    await markIntakeCompleted(id);
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link
          href="/intakes"
          className="text-sm text-tulpiaan-grijs hover:text-tulpiaan-donkergoud"
        >
          ← Terug naar intakes
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mt-2">
          <div>
            <h1 className="text-2xl font-semibold text-tulpiaan-zwart">
              {intake.positionTitle ?? "Intake"}
              {intake.clientName ? (
                <span className="text-tulpiaan-grijs font-normal"> — {intake.clientName}</span>
              ) : null}
            </h1>
            <p className="text-sm text-tulpiaan-grijs mt-1">
              Kandidaat:{" "}
              <Link
                href={`/candidates/${intake.candidate.id}`}
                className="text-tulpiaan-donkergoud hover:underline"
              >
                {intake.candidate.firstName} {intake.candidate.lastName}
              </Link>
            </p>
          </div>
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
        </div>
      </div>

      <div className="bg-tulpiaan-wit border border-tulpiaan-grijs/20 rounded-lg p-6 mb-6">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <Row label="Datum" value={formatDate(intake.intakeDate)} />
          <Row
            label="Recruiter"
            value={intake.recruiter.name ?? intake.recruiter.email}
          />
          <Row label="Functie" value={intake.positionTitle} />
          <Row label="Opdrachtgever" value={intake.clientName} />
        </dl>

        {intake.notes && (
          <div className="mt-4 pt-4 border-t border-tulpiaan-grijs/20">
            <div className="text-xs uppercase tracking-wide text-tulpiaan-grijs mb-1">
              Notities
            </div>
            <p className="text-sm whitespace-pre-wrap text-tulpiaan-zwart">
              {intake.notes}
            </p>
          </div>
        )}
      </div>

      {!isCompleted && (
        <form action={complete}>
          <button
            type="submit"
            className="rounded bg-tulpiaan-goud text-tulpiaan-zwart font-medium px-4 py-2 hover:bg-tulpiaan-donkergoud transition-colors"
          >
            Markeer als afgerond
          </button>
        </form>
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
