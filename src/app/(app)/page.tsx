import Link from "next/link";
import { Users, ClipboardList } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();
  const [candidateCount, intakeCount, openCount] = await Promise.all([
    prisma.candidate.count(),
    prisma.intake.count(),
    prisma.intake.count({
      where: { status: { in: ["setup", "intake"] } },
    }),
  ]);

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-semibold text-tulpiaan-zwart mb-2">
        Welkom{session?.user?.name ? `, ${session.user.name}` : ""}
      </h1>
      <p className="text-tulpiaan-grijs mb-8">
        Tulpiaan&apos;s tool voor het structureren van telefonische intakes en
        het genereren van voorstelteksten voor opdrachtgevers.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          href="/candidates"
          icon={Users}
          label="Kandidaten"
          value={candidateCount}
        />
        <StatCard
          href="/intakes"
          icon={ClipboardList}
          label="Intakes totaal"
          value={intakeCount}
        />
        <StatCard
          href="/intakes"
          icon={ClipboardList}
          label="Open intakes"
          value={openCount}
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
      className="bg-tulpiaan-wit border border-tulpiaan-grijs/20 rounded-lg p-5 hover:border-tulpiaan-goud transition-colors block"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-tulpiaan-ivoor flex items-center justify-center">
          <Icon className="h-5 w-5 text-tulpiaan-donkergoud" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-tulpiaan-grijs">
            {label}
          </div>
          <div className="text-2xl font-semibold text-tulpiaan-zwart">
            {value}
          </div>
        </div>
      </div>
    </Link>
  );
}
