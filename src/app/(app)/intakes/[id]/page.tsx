import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { statusForRoute } from "@/lib/intake-status";

export const dynamic = "force-dynamic";

export default async function IntakePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const intake = await prisma.intake.findUnique({
    where: { id },
    select: { id: true, status: true },
  });

  if (!intake) notFound();

  redirect(`/intakes/${intake.id}/${statusForRoute(intake.status)}`);
}
