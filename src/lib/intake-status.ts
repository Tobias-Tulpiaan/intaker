export type IntakeStatus = "setup" | "intake" | "voorstel" | "verstuurd";

export const INTAKE_STATUSES: IntakeStatus[] = [
  "setup",
  "intake",
  "voorstel",
  "verstuurd",
];

export function statusLabel(status: string): string {
  switch (status) {
    case "setup":
      return "Setup";
    case "intake":
      return "Intake";
    case "voorstel":
      return "Voorstel klaar";
    case "verstuurd":
      return "Verstuurd";
    default:
      return status;
  }
}

export function statusPillClass(status: string): string {
  switch (status) {
    case "setup":
      return "bg-gray-100 text-gray-700 border border-gray-200 font-medium";
    case "intake":
      return "bg-blue-50 text-blue-800 border border-blue-200 font-medium";
    case "voorstel":
      return "bg-tulpiaan-ivoor text-tulpiaan-donkergoud border border-tulpiaan-goud/40 font-medium";
    case "verstuurd":
      return "bg-green-100 text-green-800 border border-green-200 font-medium";
    default:
      return "bg-gray-100 text-gray-700 border border-gray-200 font-medium";
  }
}

export function nextStatusAfter(current: string): IntakeStatus {
  switch (current) {
    case "setup":
      return "intake";
    case "intake":
      return "voorstel";
    case "voorstel":
      return "verstuurd";
    default:
      return current as IntakeStatus;
  }
}

export function statusForRoute(status: string): "setup" | "intake" | "voorstel" {
  if (status === "verstuurd") return "voorstel";
  if (status === "voorstel") return "voorstel";
  if (status === "intake") return "intake";
  return "setup";
}
