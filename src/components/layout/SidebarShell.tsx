"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Users, ClipboardList, Menu, X } from "lucide-react";
import { logoutAction } from "./actions";

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

export function SidebarShell({
  user,
}: {
  user: { name: string | null; email: string | null };
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between bg-tulpiaan-zwart text-tulpiaan-ivoor px-4 h-14">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Menu openen"
          className="p-2 -ml-2 rounded hover:bg-tulpiaan-grijs/20"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-tulpiaan-goud font-semibold tracking-wide text-sm">
          TULPIAAN INTAKER
        </span>
        <span className="w-9" aria-hidden />
      </header>

      {open && (
        <button
          type="button"
          aria-label="Menu sluiten"
          onClick={() => setOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/50"
        />
      )}

      <aside
        className={
          "fixed md:static inset-y-0 left-0 z-50 w-[260px] md:w-[240px] shrink-0 " +
          "bg-tulpiaan-zwart text-tulpiaan-ivoor flex flex-col " +
          "transition-transform md:transition-none " +
          (open ? "translate-x-0" : "-translate-x-full md:translate-x-0")
        }
      >
        <div className="hidden md:block px-5 py-6 border-b border-tulpiaan-grijs/30">
          <h1 className="text-tulpiaan-goud font-semibold tracking-wide text-sm">
            TULPIAAN INTAKER
          </h1>
        </div>

        <div className="md:hidden flex items-center justify-between px-4 h-14 border-b border-tulpiaan-grijs/30">
          <span className="text-tulpiaan-goud font-semibold tracking-wide text-sm">
            TULPIAAN INTAKER
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Menu sluiten"
            className="p-2 -mr-2 rounded hover:bg-tulpiaan-grijs/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors " +
                  (active
                    ? "bg-tulpiaan-grijs/20 text-tulpiaan-ivoor"
                    : "text-tulpiaan-ivoor hover:bg-tulpiaan-grijs/20")
                }
              >
                <Icon className="h-4 w-4 text-tulpiaan-goud" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-tulpiaan-grijs/30 px-3 py-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-tulpiaan-goud text-tulpiaan-zwart flex items-center justify-center font-semibold text-sm shrink-0">
            {initials(user.name, user.email)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
              {user.name ?? user.email ?? "Onbekend"}
            </div>
            <form action={logoutAction}>
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
    </>
  );
}
