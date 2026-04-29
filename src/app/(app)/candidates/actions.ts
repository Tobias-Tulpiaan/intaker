"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const candidateSchema = z.object({
  firstName: z.string().trim().min(1, "Voornaam is verplicht"),
  lastName: z.string().trim().min(1, "Achternaam is verplicht"),
  email: z
    .string()
    .trim()
    .email("Ongeldig e-mailadres")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  phone: z.string().trim().optional().or(z.literal("").transform(() => undefined)),
  city: z.string().trim().optional().or(z.literal("").transform(() => undefined)),
  linkedinUrl: z
    .string()
    .trim()
    .url("LinkedIn-URL is ongeldig")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  notes: z.string().trim().optional().or(z.literal("").transform(() => undefined)),
});

export type CandidateFormState = {
  error?: string;
};

export async function createCandidate(
  _prev: CandidateFormState,
  formData: FormData,
): Promise<CandidateFormState> {
  const session = await auth();
  if (!session?.user) {
    return { error: "Niet ingelogd" };
  }

  const parsed = candidateSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    city: formData.get("city"),
    linkedinUrl: formData.get("linkedinUrl"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  try {
    const candidate = await prisma.candidate.create({
      data: parsed.data,
    });
    revalidatePath("/candidates");
    redirect(`/candidates/${candidate.id}`);
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
      return { error: "Er bestaat al een kandidaat met dit e-mailadres" };
    }
    throw err;
  }
}
