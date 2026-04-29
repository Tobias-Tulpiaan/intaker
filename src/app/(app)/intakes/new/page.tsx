import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NewIntakeForm } from "./NewIntakeForm";

type SearchParams = Promise<{ candidateId?: string }>;

export const dynamic = "force-dynamic";

export default async function NewIntakePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { candidateId } = await searchParams;

  const candidates = await prisma.candidate.findMany({
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    select: { id: true, firstName: true, lastName: true },
  });

  if (candidates.length === 0) {
    redirect("/candidates/new");
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href="/intakes"
          className="text-sm text-tulpiaan-grijs hover:text-tulpiaan-donkergoud"
        >
          ← Terug naar intakes
        </Link>
        <h1 className="text-2xl font-semibold text-tulpiaan-zwart mt-2">
          Nieuwe intake
        </h1>
      </div>

      <NewIntakeForm
        candidates={candidates}
        defaultCandidateId={candidateId}
      />
    </div>
  );
}
