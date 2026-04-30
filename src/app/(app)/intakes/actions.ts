"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const intakeSchema = z.object({
  candidateId: z.string().min(1, "Kies een kandidaat"),
});

export type IntakeFormState = {
  error?: string;
};

export async function createIntake(
  _prev: IntakeFormState,
  formData: FormData,
): Promise<IntakeFormState> {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return { error: "Niet ingelogd" };
  }

  const parsed = intakeSchema.safeParse({
    candidateId: formData.get("candidateId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  const candidate = await prisma.candidate.findUnique({
    where: { id: parsed.data.candidateId },
    select: { id: true },
  });
  if (!candidate) {
    return { error: "Kandidaat niet gevonden" };
  }

  const intake = await prisma.intake.create({
    data: {
      candidateId: parsed.data.candidateId,
      recruiterId: userId,
      status: "setup",
    },
  });

  revalidatePath("/intakes");
  revalidatePath(`/candidates/${parsed.data.candidateId}`);
  redirect(`/intakes/${intake.id}/setup`);
}
