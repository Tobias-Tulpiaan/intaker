import Link from "next/link";
import { Home, Users, ClipboardList } from "lucide-react";
import { auth, signOut } from "@/auth";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/candidates", label: "Kandidaten", icon: Users },
  { href: "/intakes", label: "Intakes", icon: ClipboardList },
];

function initials(name?: string | null, email?: string | null) {
  const source = (name ?? email ?? "?").trim();
  const parts = source.split(/[\s.@]+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return letters.join("") || "?";
}

export async function Sidebar() {
  const session = await auth();
  const user = session?.user;

  return (
    <aside className="w-[240px] shrink-0 bg-tulpiaan-zwart text-tulpiaan-ivoor flex flex-col min-h-screen">
      <div className="px-5 py-6 border-b border-tulpiaan-grijs/30">
        <h1 className="text-tulpiaan-goud font-semibold tracking-wide text-sm">
          TULPIAAN INTAKER
        </h1>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded px-3 py-2 text-sm text-tulpiaan-ivoor hover:bg-tulpiaan-grijs/20 transition-colors"
            >
              <Icon className="h-4 w-4 text-tulpiaan-goud" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-tulpiaan-grijs/30 px-3 py-4 flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-tulpiaan-goud text-tulpiaan-zwart flex items-center justify-center font-semibold text-sm shrink-0">
          {initials(user?.name, user?.email)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">
            {user?.name ?? user?.email ?? "Onbekend"}
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="text-xs text-tulpiaan-grijs hover:text-tulpiaan-goud transition-colors"
            >
              Uitloggen
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
