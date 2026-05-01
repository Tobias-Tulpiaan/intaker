import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Stepper } from "@/components/intake/Stepper";
import { handtekeningTekst } from "@/lib/handtekening";
import { VoorstelWorkspace } from "./VoorstelWorkspace";

export const dynamic = "force-dynamic";

export default async function VoorstelPage({
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
    include: { candidate: true },
  });
  if (!intake || intake.recruiterId !== userId) notFound();

  const handtekening = handtekeningTekst(intake.afzender);

  return (
    <div className="max-w-3xl">
      <Stepper intakeId={intake.id} active="voorstel" />
      <h1 className="text-2xl font-semibold text-tulpiaan-zwart mb-1">
        Voorstel — {intake.candidate.firstName} {intake.candidate.lastName}
      </h1>
      <p className="text-sm text-tulpiaan-grijs mb-6">
        Genereer een voorsteltekst en bewerk waar nodig. Wijzigingen worden
        automatisch opgeslagen.
      </p>

      <VoorstelWorkspace
        intakeId={intake.id}
        initialTekst={intake.voorstelTekst ?? ""}
        initialTekstV2={intake.voorstelTekstV2 ?? null}
        kandidaatNaam={`${intake.candidate.firstName} ${intake.candidate.lastName}`}
        handtekening={handtekening}
        status={intake.status}
        gegenereerdOp={intake.voorstelGegenereerdOp?.toISOString() ?? null}
      />
    </div>
  );
}
