import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Stepper } from "@/components/intake/Stepper";
import type { OpMaatVraag } from "@/lib/intake-ai";
import { IntakeWorkspace } from "./IntakeWorkspace";

export const dynamic = "force-dynamic";

export default async function IntakePage({
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
      candidate: { select: { firstName: true, lastName: true } },
    },
  });
  if (!intake || intake.recruiterId !== userId) notFound();

  const opMaatVragen = (intake.opMaatVragen as OpMaatVraag[] | null) ?? [];

  return (
    <div>
      <Stepper intakeId={intake.id} active="intake" />
      <div className="mb-4 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
        <h1 className="text-2xl font-semibold text-tulpiaan-zwart">
          Intake — {intake.candidate.firstName} {intake.candidate.lastName}
        </h1>
        <Link
          href={`/intakes/${intake.id}/setup`}
          className="text-sm text-tulpiaan-grijs hover:text-tulpiaan-donkergoud"
        >
          ← Setup aanpassen
        </Link>
      </div>

      <IntakeWorkspace
        intakeId={intake.id}
        opMaatVragen={opMaatVragen}
        initial={{
          woonplaats: intake.woonplaats ?? "",
          leeftijd: intake.leeftijd ?? "",
          priveSituatie: intake.priveSituatie ?? "",
          huidigeWerkgever: intake.huidigeWerkgever ?? "",
          huidigeRol: intake.huidigeRol ?? "",
          huidigeRolToelichting: intake.huidigeRolToelichting ?? "",
          klantsegment: intake.klantsegment ?? "",
          eerdereErvaring: intake.eerdereErvaring ?? "",
          redenVervolgstap: intake.redenVervolgstap ?? "",
          matchToelichting: intake.matchToelichting ?? "",
          anekdote: intake.anekdote ?? "",
          haakjes: intake.haakjes ?? "",
          nuance: intake.nuance ?? "",
          uren: intake.uren ?? "",
          salaris: intake.salaris ?? "",
          bonusLease: intake.bonusLease ?? "",
          opzegtermijn: intake.opzegtermijn ?? "",
          beschikbaarheid: intake.beschikbaarheid ?? "",
          hybride: intake.hybride ?? "",
          kladblok: intake.kladblok ?? "",
          opMaatVragen: opMaatVragen,
        }}
      />
    </div>
  );
}
