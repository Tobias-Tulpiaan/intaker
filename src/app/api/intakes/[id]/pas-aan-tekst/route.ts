import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { pasAanTekst } from "@/lib/intake-ai";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  opmerkingen: z.string().trim().min(1, "Geef opmerkingen mee"),
});

export async function POST(
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
    select: { recruiterId: true, voorstelTekst: true },
  });
  if (!intake || intake.recruiterId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const tekst = intake.voorstelTekst?.trim();
  if (!tekst) {
    return NextResponse.json(
      { error: "Geen voorsteltekst om aan te passen" },
      { status: 400 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid body" },
      { status: 400 },
    );
  }

  try {
    const suggesties = await pasAanTekst(tekst, parsed.data.opmerkingen);
    return NextResponse.json({ suggesties });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "AI-call faalde";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
