import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const patchSchema = z
  .object({
    woonplaats: z.string().nullable().optional(),
    leeftijd: z.string().nullable().optional(),
    priveSituatie: z.string().nullable().optional(),
    huidigeWerkgever: z.string().nullable().optional(),
    huidigeRol: z.string().nullable().optional(),
    huidigeRolToelichting: z.string().nullable().optional(),
    klantsegment: z.string().nullable().optional(),
    eerdereErvaring: z.string().nullable().optional(),
    redenVervolgstap: z.string().nullable().optional(),
    matchToelichting: z.string().nullable().optional(),
    anekdote: z.string().nullable().optional(),
    haakjes: z.string().nullable().optional(),
    nuance: z.string().nullable().optional(),
    uren: z.string().nullable().optional(),
    salaris: z.string().nullable().optional(),
    bonusLease: z.string().nullable().optional(),
    opzegtermijn: z.string().nullable().optional(),
    beschikbaarheid: z.string().nullable().optional(),
    hybride: z.string().nullable().optional(),
    kladblok: z.string().nullable().optional(),
    matchAnalyse: z.string().nullable().optional(),
    ankerZin: z.string().nullable().optional(),
    verzwijgDit: z.string().nullable().optional(),
    vrijInvullenTekst: z.string().nullable().optional(),
    opMaatVragen: z.unknown().optional(),
    voorstelTekst: z.string().nullable().optional(),
    voorstelTekstV2: z.string().nullable().optional(),
    status: z.enum(["setup", "intake", "voorstel", "verstuurd"]).optional(),
  })
  .strict();

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const intake = await prisma.intake.findUnique({
    where: { id },
    select: { recruiterId: true },
  });
  if (!intake || intake.recruiterId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const data = parsed.data as Record<string, unknown>;
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ ok: true, updated: 0 });
  }

  await prisma.intake.update({
    where: { id },
    data: data as never,
  });

  return NextResponse.json({ ok: true, updated: Object.keys(data).length });
}
