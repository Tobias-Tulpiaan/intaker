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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-tulpiaan-zwart">Kandidaten</h1>
        <Link
          href="/candidates/new"
          className="inline-flex items-center gap-2 rounded bg-tulpiaan-goud text-tulpiaan-zwart font-medium px-4 py-2 hover:bg-tulpiaan-donkergoud transition-colors"
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
        <div className="overflow-hidden rounded border border-tulpiaan-grijs/20 bg-tulpiaan-wit">
          <table className="w-full text-sm">
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
      )}
    </div>
  );
}
