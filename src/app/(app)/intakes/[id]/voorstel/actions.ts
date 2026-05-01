"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateVoorstel, type VoorstelStijl } from "@/lib/intake-ai";

export type VoorstelResult =
  | { ok: true; tekst: string; stijl: VoorstelStijl | null }
  | { ok: false; error: string };

export async function genereerVoorstel(
  intakeId: string,
  _rawStijl?: string,
): Promise<VoorstelResult> {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return { ok: false, error: "Niet ingelogd" };

  const intake = await prisma.intake.findUnique({
    where: { id: intakeId },
    select: { recruiterId: true },
  });
  if (!intake || intake.recruiterId !== userId) {
    return { ok: false, error: "Intake niet gevonden" };
  }

  try {
    const tekst = await generateVoorstel(intakeId);
    await prisma.intake.update({
      where: { id: intakeId },
      data: {
        voorstelTekst: tekst,
        voorstelGegenereerdOp: new Date(),
        status: "voorstel",
      },
    });
    revalidatePath(`/intakes/${intakeId}`);
    revalidatePath(`/intakes/${intakeId}/voorstel`);
    revalidatePath("/intakes");
    return { ok: true, tekst, stijl: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Onbekende fout";
    return { ok: false, error: msg };
  }
}

export async function saveVoorstelTekst(intakeId: string, tekst: string) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return { ok: false as const, error: "Niet ingelogd" };
  const intake = await prisma.intake.findUnique({
    where: { id: intakeId },
    select: { recruiterId: true },
  });
  if (!intake || intake.recruiterId !== userId) {
    return { ok: false as const, error: "Intake niet gevonden" };
  }
  await prisma.intake.update({
    where: { id: intakeId },
    data: { voorstelTekst: tekst },
  });
  revalidatePath(`/intakes/${intakeId}/voorstel`);
  return { ok: true as const };
}

export async function kiesVoorstelVersie(intakeId: string, versie: 1 | 2) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return { ok: false as const, error: "Niet ingelogd" };
  const intake = await prisma.intake.findUnique({
    where: { id: intakeId },
    select: { recruiterId: true, voorstelTekst: true, voorstelTekstV2: true },
  });
  if (!intake || intake.recruiterId !== userId) {
    return { ok: false as const, error: "Intake niet gevonden" };
  }
  if (versie === 2) {
    const v2 = intake.voorstelTekstV2;
    if (!v2) {
      return { ok: false as const, error: "Versie 2 bestaat niet" };
    }
    await prisma.intake.update({
      where: { id: intakeId },
      data: { voorstelTekst: v2, voorstelTekstV2: null },
    });
  } else {
    await prisma.intake.update({
      where: { id: intakeId },
      data: { voorstelTekstV2: null },
    });
  }
  revalidatePath(`/intakes/${intakeId}/voorstel`);
  return { ok: true as const };
}

export async function markeerVerstuurd(intakeId: string) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return { ok: false as const, error: "Niet ingelogd" };
  const intake = await prisma.intake.findUnique({
    where: { id: intakeId },
    select: { recruiterId: true },
  });
  if (!intake || intake.recruiterId !== userId) {
    return { ok: false as const, error: "Intake niet gevonden" };
  }
  await prisma.intake.update({
    where: { id: intakeId },
    data: { status: "verstuurd" },
  });
  revalidatePath(`/intakes/${intakeId}/voorstel`);
  revalidatePath("/intakes");
  return { ok: true as const };
}
