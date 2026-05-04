import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { statusLabel, statusPillClass } from "@/lib/intake-status";

export const dynamic = "force-dynamic";

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("nl-NL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export default async function IntakesPage() {
  const intakes = await prisma.intake.findMany({
    orderBy: { intakeDate: "desc" },
    include: {
      candidate: { select: { firstName: true, lastName: true } },
      recruiter: { select: { name: true, email: true } },
    },
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-semibold text-tulpiaan-zwart">Intakes</h1>
        <Link
          href="/intakes/new"
          className="inline-flex items-center justify-center gap-2 rounded bg-tulpiaan-goud text-white font-semibold px-4 py-2 hover:bg-tulpiaan-donkergoud transition-colors w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Nieuwe intake
        </Link>
      </div>

      {intakes.length === 0 ? (
        <div className="rounded border border-dashed border-tulpiaan-grijs/40 bg-tulpiaan-wit p-8 text-center">
          <p className="text-tulpiaan-grijs">Nog geen intakes.</p>
          <Link
            href="/intakes/new"
            className="inline-block mt-3 text-tulpiaan-donkergoud hover:underline font-medium"
          >
            Start de eerste
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <ul className="sm:hidden space-y-2">
            {intakes.map((i) => (
              <li
                key={i.id}
                className="bg-tulpiaan-wit border border-tulpiaan-grijs/20 rounded-lg p-4 hover:border-tulpiaan-goud transition-colors"
              >
                <Link href={`/intakes/${i.id}`} className="block">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-tulpiaan-zwart truncate">
                        {i.candidate.firstName} {i.candidate.lastName}
                      </div>
                      <div className="text-xs text-tulpiaan-grijs mt-0.5 truncate">
                        {i.positionTitle ?? "—"}
                        {i.clientName ? ` · ${i.clientName}` : ""}
                      </div>
                      <div className="text-xs text-tulpiaan-grijs mt-0.5">
                        {formatDate(i.intakeDate)}
                      </div>
                    </div>
                    <span
                      className={
                        "inline-flex text-xs px-2 py-1 rounded-full whitespace-nowrap " +
                        statusPillClass(i.status)
                      }
                    >
                      {statusLabel(i.status)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto rounded border border-tulpiaan-grijs/20 bg-tulpiaan-wit">
            <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-tulpiaan-ivoor border-b border-tulpiaan-grijs/20">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-tulpiaan-grijs">Kandidaat</th>
                <th className="text-left px-4 py-3 font-medium text-tulpiaan-grijs">Functie</th>
                <th className="text-left px-4 py-3 font-medium text-tulpiaan-grijs">Opdrachtgever</th>
                <th className="text-left px-4 py-3 font-medium text-tulpiaan-grijs">Recruiter</th>
                <th className="text-left px-4 py-3 font-medium text-tulpiaan-grijs">Datum</th>
                <th className="text-left px-4 py-3 font-medium text-tulpiaan-grijs">Status</th>
              </tr>
            </thead>
            <tbody>
              {intakes.map((i) => (
                <tr
                  key={i.id}
                  className="border-b border-tulpiaan-grijs/10 last:border-0 hover:bg-tulpiaan-ivoor/50"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/intakes/${i.id}`}
                      className="text-tulpiaan-zwart font-medium hover:text-tulpiaan-donkergoud"
                    >
                      {i.candidate.firstName} {i.candidate.lastName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-tulpiaan-grijs">{i.positionTitle ?? "—"}</td>
                  <td className="px-4 py-3 text-tulpiaan-grijs">{i.clientName ?? "—"}</td>
                  <td className="px-4 py-3 text-tulpiaan-grijs">
                    {i.recruiter.name ?? i.recruiter.email}
                  </td>
                  <td className="px-4 py-3 text-tulpiaan-grijs">{formatDate(i.intakeDate)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        "inline-flex text-xs px-2 py-1 rounded-full " +
                        statusPillClass(i.status)
                      }
                    >
                      {statusLabel(i.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </>
      )}
    </div>
  );
}
