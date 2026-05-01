import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Stepper } from "@/components/intake/Stepper";
import { SetupForm } from "./SetupForm";

export const dynamic = "force-dynamic";

export default async function SetupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) notFound();

  const intake = await prisma.intake.findUnique({
    where: { id },
    include: {
      candidate: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  if (!intake || intake.recruiterId !== userId) notFound();

  const candidates = await prisma.candidate.findMany({
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    select: { id: true, firstName: true, lastName: true },
  });

  return (
    <div className="max-w-3xl">
      <Stepper intakeId={intake.id} active="setup" />
      <h1 className="text-2xl font-semibold text-tulpiaan-zwart mb-1">Setup</h1>
      <p className="text-sm text-tulpiaan-grijs mb-6">
        Vul vacature, werkervaring en bedrijfswebsite — daarna genereren we
        op-maat-vragen voor het gesprek.
      </p>
      <SetupForm
        intake={{
          id: intake.id,
          candidateId: intake.candidateId,
          positionTitle: intake.positionTitle ?? "",
          clientName: intake.clientName ?? "",
          contactpersoon: intake.contactpersoon ?? "",
          afzender: (intake.afzender as "tobias" | "ralf") ?? "tobias",
          vacatureTekst: intake.vacatureTekst ?? "",
          werkervaringTekst: intake.werkervaringTekst ?? "",
          bedrijfsUrl: intake.bedrijfsUrl ?? "",
          matchAnalyse: intake.matchAnalyse ?? "",
          ankerZin: intake.ankerZin ?? "",
          verzwijgDit: intake.verzwijgDit ?? "",
        }}
        candidates={candidates}
      />
    </div>
  );
}
