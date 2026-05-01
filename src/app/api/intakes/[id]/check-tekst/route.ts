import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { checkTekst } from "@/lib/intake-ai";

export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
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
      { error: "Geen voorsteltekst om te controleren" },
      { status: 400 },
    );
  }

  try {
    const suggesties = await checkTekst(tekst);
    return NextResponse.json({ suggesties });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "AI-call faalde";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
