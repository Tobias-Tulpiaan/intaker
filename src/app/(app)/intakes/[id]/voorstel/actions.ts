"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateVoorstel, type VoorstelStijl } from "@/lib/intake-ai";

const stijlSchema = z.enum(["recht", "warm", "pareltje", "zorgvuldig"]);

export type VoorstelResult =
  | { ok: true; tekst: string; stijl: VoorstelStijl }
  | { ok: false; error: string };

export async function genereerVoorstel(
  intakeId: string,
  rawStijl: string,
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

  const parsedStijl = stijlSchema.safeParse(rawStijl);
  if (!parsedStijl.success) {
    return { ok: false, error: "Ongeldige stijl" };
  }
  const stijl = parsedStijl.data;

  try {
    const tekst = await generateVoorstel(intakeId, stijl);
    await prisma.intake.update({
      where: { id: intakeId },
      data: {
        voorstelStijl: stijl,
        voorstelTekst: tekst,
        voorstelGegenereerdOp: new Date(),
        status: "voorstel",
      },
    });
    revalidatePath(`/intakes/${intakeId}`);
    revalidatePath(`/intakes/${intakeId}/voorstel`);
    revalidatePath("/intakes");
    return { ok: true, tekst, stijl };
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
