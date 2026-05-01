import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateVoorstel, regenereerVoorstel } from "@/lib/intake-ai";

export const dynamic = "force-dynamic";

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

  const url = new URL(req.url);
  const regenerate = url.searchParams.get("regenerate") === "true";

  try {
    if (regenerate) {
      const eerdereVersie = intake.voorstelTekst?.trim();
      if (!eerdereVersie) {
        return NextResponse.json(
          { error: "Geen eerdere versie om te regenereren" },
          { status: 400 },
        );
      }
      const tekst = await regenereerVoorstel(id, eerdereVersie);
      await prisma.intake.update({
        where: { id },
        data: {
          voorstelTekstV2: tekst,
          voorstelGegenereerdOp: new Date(),
        },
      });
      revalidatePath(`/intakes/${id}/voorstel`);
      return NextResponse.json({ tekst, slot: "v2" });
    } else {
      const tekst = await generateVoorstel(id);
      await prisma.intake.update({
        where: { id },
        data: {
          voorstelTekst: tekst,
          voorstelGegenereerdOp: new Date(),
          status: "voorstel",
        },
      });
      revalidatePath(`/intakes/${id}/voorstel`);
      revalidatePath("/intakes");
      return NextResponse.json({ tekst, slot: "v1" });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "AI-call faalde";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
