import Link from "next/link";

type Step = "setup" | "intake" | "voorstel";

const STEPS: { key: Step; label: string }[] = [
  { key: "setup", label: "Setup" },
  { key: "intake", label: "Intake" },
  { key: "voorstel", label: "Voorstel" },
];

export function Stepper({
  intakeId,
  active,
}: {
  intakeId: string;
  active: Step;
}) {
  const activeIdx = STEPS.findIndex((s) => s.key === active);

  return (
    <nav aria-label="Stappen" className="mb-6">
      <ol className="flex items-center gap-2 sm:gap-3 text-sm">
        {STEPS.map((step, idx) => {
          const isActive = step.key === active;
          const isPast = idx < activeIdx;
          const isFuture = idx > activeIdx;

          const classes = isActive
            ? "bg-tulpiaan-goud text-tulpiaan-zwart font-medium"
            : isPast
            ? "bg-tulpiaan-ivoor text-tulpiaan-zwart border border-tulpiaan-grijs/30 hover:border-tulpiaan-goud"
            : "bg-tulpiaan-ivoor text-tulpiaan-grijs border border-tulpiaan-grijs/20";

          const content = (
            <span
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${classes}`}
            >
              <span
                className={`h-5 w-5 rounded-full flex items-center justify-center text-xs ${
                  isActive
                    ? "bg-tulpiaan-zwart text-tulpiaan-goud"
                    : isPast
                    ? "bg-tulpiaan-goud text-tulpiaan-zwart"
                    : "bg-tulpiaan-grijs/20 text-tulpiaan-grijs"
                }`}
              >
                {idx + 1}
              </span>
              {step.label}
            </span>
          );

          return (
            <li key={step.key} className="flex items-center gap-2 sm:gap-3">
              {isFuture ? (
                content
              ) : (
                <Link href={`/intakes/${intakeId}/${step.key}`}>{content}</Link>
              )}
              {idx < STEPS.length - 1 && (
                <span className="text-tulpiaan-grijs/40 hidden sm:inline">→</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
