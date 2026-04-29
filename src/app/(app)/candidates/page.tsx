import Link from "next/link";
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

export default async function CandidatesPage() {
  const candidates = await prisma.candidate.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { intakes: true } } },
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-semibold text-tulpiaan-zwart">Kandidaten</h1>
        <Link
          href="/candidates/new"
          className="inline-flex items-center justify-center gap-2 rounded bg-tulpiaan-goud text-tulpiaan-zwart font-medium px-4 py-2 hover:bg-tulpiaan-donkergoud transition-colors w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Nieuwe kandidaat
        </Link>
      </div>

      {candidates.length === 0 ? (
        <div className="rounded border border-dashed border-tulpiaan-grijs/40 bg-tulpiaan-wit p-8 text-center">
          <p className="text-tulpiaan-grijs">Nog geen kandidaten.</p>
          <Link
            href="/candidates/new"
            className="inline-block mt-3 text-tulpiaan-donkergoud hover:underline font-medium"
          >
            Voeg de eerste toe
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <ul className="sm:hidden space-y-2">
            {candidates.map((c) => (
              <li
                key={c.id}
                className="bg-tulpiaan-wit border border-tulpiaan-grijs/20 rounded-lg p-4 hover:border-tulpiaan-goud transition-colors"
              >
                <Link href={`/candidates/${c.id}`} className="block">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-tulpiaan-zwart truncate">
                        {c.firstName} {c.lastName}
                      </div>
                      <div className="text-xs text-tulpiaan-grijs mt-0.5 truncate">
                        {c.email ?? "geen e-mail"}
                        {c.city ? ` · ${c.city}` : ""}
                      </div>
                    </div>
                    <div className="text-xs text-tulpiaan-grijs whitespace-nowrap">
                      {c._count.intakes} intake{c._count.intakes === 1 ? "" : "s"}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto rounded border border-tulpiaan-grijs/20 bg-tulpiaan-wit">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-tulpiaan-ivoor border-b border-tulpiaan-grijs/20">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-tulpiaan-grijs">Naam</th>
                  <th className="text-left px-4 py-3 font-medium text-tulpiaan-grijs">E-mail</th>
                  <th className="text-left px-4 py-3 font-medium text-tulpiaan-grijs">Woonplaats</th>
                  <th className="text-left px-4 py-3 font-medium text-tulpiaan-grijs">Intakes</th>
                  <th className="text-left px-4 py-3 font-medium text-tulpiaan-grijs">Toegevoegd</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-tulpiaan-grijs/10 last:border-0 hover:bg-tulpiaan-ivoor/50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/candidates/${c.id}`}
                        className="text-tulpiaan-zwart font-medium hover:text-tulpiaan-donkergoud"
                      >
                        {c.firstName} {c.lastName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-tulpiaan-grijs">{c.email ?? "—"}</td>
                    <td className="px-4 py-3 text-tulpiaan-grijs">{c.city ?? "—"}</td>
                    <td className="px-4 py-3 text-tulpiaan-grijs">{c._count.intakes}</td>
                    <td className="px-4 py-3 text-tulpiaan-grijs">{formatDate(c.createdAt)}</td>
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
