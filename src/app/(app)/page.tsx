import Link from "next/link";
import { CheckSquare, FileText, Send } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [actieveCount, voorstelCount, verstuurdWeekCount] = await Promise.all([
    prisma.intake.count({
      where: { status: { not: "verstuurd" } },
    }),
    prisma.intake.count({
      where: { status: "voorstel" },
    }),
    prisma.intake.count({
      where: {
        status: "verstuurd",
        updatedAt: { gt: sevenDaysAgo },
      },
    }),
  ]);

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-semibold text-tulpiaan-zwart mb-2">
        Welkom{session?.user?.name ? `, ${session.user.name}` : ""}
      </h1>
      <p className="text-tulpiaan-grijs mb-8">
        Tulpiaan&apos;s tool voor het structureren van telefonische intakes en
        het genereren van voorstelteksten voor opdrachtgevers.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          href="/intakes"
          icon={CheckSquare}
          label="Actieve intakes"
          value={actieveCount}
        />
        <StatCard
          href="/intakes"
          icon={FileText}
          label="Voorstellen klaar"
          value={voorstelCount}
        />
        <StatCard
          href="/intakes"
          icon={Send}
          label="Verstuurd deze week"
          value={verstuurdWeekCount}
        />
      </div>
    </div>
  );
}

function StatCard({
  href,
  icon: Icon,
  label,
  value,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <Link
      href={href}
      className="bg-white border border-black/[0.08] rounded-xl p-6 hover:border-tulpiaan-goud/60 hover:shadow-sm transition-all block group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-4xl font-semibold text-tulpiaan-zwart leading-none">
            {value}
          </div>
          <div className="text-sm text-tulpiaan-grijs mt-3">{label}</div>
        </div>
        <div className="h-10 w-10 rounded-full bg-tulpiaan-ivoor flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-tulpiaan-goud" />
        </div>
      </div>
    </Link>
  );
}
