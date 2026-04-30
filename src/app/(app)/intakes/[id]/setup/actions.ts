"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateVragen } from "@/lib/intake-ai";

const setupSchema = z.object({
  intakeId: z.string().min(1),
  mode: z.enum(["existing", "new"]),
  candidateId: z.string().optional(),
  newFirstName: z.string().optional(),
  newLastName: z.string().optional(),
  newEmail: z.string().optional(),
  newPhone: z.string().optional(),
  positionTitle: z.string().optional(),
  clientName: z.string().optional(),
  contactpersoon: z.string().optional(),
  afzender: z.enum(["tobias", "ralf"]).default("tobias"),
  vacatureTekst: z.string().optional(),
  werkervaringTekst: z.string().optional(),
  bedrijfsUrl: z.string().optional(),
});

function s(v: FormDataEntryValue | null): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t === "" ? undefined : t;
}

export type SetupFormState = {
  error?: string;
};

export async function saveSetupAndGenerate(
  _prev: SetupFormState,
  formData: FormData,
): Promise<SetupFormState> {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return { error: "Niet ingelogd" };

  const parsed = setupSchema.safeParse({
    intakeId: formData.get("intakeId"),
    mode: formData.get("mode") ?? "existing",
    candidateId: s(formData.get("candidateId")),
    newFirstName: s(formData.get("newFirstName")),
    newLastName: s(formData.get("newLastName")),
    newEmail: s(formData.get("newEmail")),
    newPhone: s(formData.get("newPhone")),
    positionTitle: s(formData.get("positionTitle")),
    clientName: s(formData.get("clientName")),
    contactpersoon: s(formData.get("contactpersoon")),
    afzender: formData.get("afzender") ?? "tobias",
    vacatureTekst: s(formData.get("vacatureTekst")),
    werkervaringTekst: s(formData.get("werkervaringTekst")),
    bedrijfsUrl: s(formData.get("bedrijfsUrl")),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }
  const data = parsed.data;

  let candidateId = data.candidateId;
  if (data.mode === "new") {
    if (!data.newFirstName || !data.newLastName) {
      return { error: "Voornaam en achternaam zijn verplicht voor een nieuwe kandidaat" };
    }
    try {
      const created = await prisma.candidate.create({
        data: {
          firstName: data.newFirstName,
          lastName: data.newLastName,
          email: data.newEmail,
          phone: data.newPhone,
        },
      });
      candidateId = created.id;
    } catch (err) {
      if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
        return { error: "Er bestaat al een kandidaat met dit e-mailadres" };
      }
      throw err;
    }
  }

  if (!candidateId) {
    return { error: "Kies een kandidaat of maak een nieuwe aan" };
  }

  const intake = await prisma.intake.findUnique({
    where: { id: data.intakeId },
    select: { recruiterId: true },
  });
  if (!intake || intake.recruiterId !== userId) {
    return { error: "Intake niet gevonden" };
  }

  await prisma.intake.update({
    where: { id: data.intakeId },
    data: {
      candidateId,
      positionTitle: data.positionTitle,
      clientName: data.clientName,
      contactpersoon: data.contactpersoon,
      afzender: data.afzender,
      vacatureTekst: data.vacatureTekst,
      werkervaringTekst: data.werkervaringTekst,
      bedrijfsUrl: data.bedrijfsUrl,
    },
  });

  try {
    const vragen = await generateVragen(data.intakeId);
    await prisma.intake.update({
      where: { id: data.intakeId },
      data: { opMaatVragen: vragen, status: "intake" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "AI-call faalde";
    return { error: `Genereren van vragen faalde: ${msg}` };
  }

  revalidatePath(`/intakes/${data.intakeId}`);
  revalidatePath("/intakes");
  redirect(`/intakes/${data.intakeId}/intake`);
}
