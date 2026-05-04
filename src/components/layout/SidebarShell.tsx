"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Home,
  Users,
  ClipboardList,
  Menu,
  X,
  Settings,
  LogOut,
} from "lucide-react";
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
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between bg-white text-tulpiaan-zwart px-4 h-14 border-b border-black/[0.08]">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Menu openen"
          className="p-2 -ml-2 rounded hover:bg-tulpiaan-ivoor"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-tulpiaan-goud font-semibold tracking-wide text-sm">
          Tulpiaan
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
          "bg-white text-tulpiaan-zwart flex flex-col " +
          "border-r border-black/[0.08] " +
          "transition-transform md:transition-none " +
          (open ? "translate-x-0" : "-translate-x-full md:translate-x-0")
        }
      >
        <div className="hidden md:flex items-center gap-3 px-5 py-5 border-b border-black/[0.08]">
          <div className="h-9 w-9 rounded-md bg-tulpiaan-goud text-white flex items-center justify-center font-semibold text-sm shrink-0">
            T
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="text-tulpiaan-goud font-semibold leading-tight"
              style={{ fontSize: 17 }}
            >
              Tulpiaan
            </div>
            <div
              className="text-tulpiaan-grijs leading-tight"
              style={{ fontSize: 11 }}
            >
              Intaker Dashboard
            </div>
          </div>
          <button
            type="button"
            aria-label="Sidebar inklappen"
            className="text-tulpiaan-grijs hover:text-tulpiaan-zwart transition-colors text-base leading-none px-1"
          >
            ‹
          </button>
        </div>

        <div className="md:hidden flex items-center justify-between px-4 h-14 border-b border-black/[0.08]">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-tulpiaan-goud text-white flex items-center justify-center font-semibold text-xs">
              T
            </div>
            <div className="leading-tight">
              <div
                className="text-tulpiaan-goud font-semibold"
                style={{ fontSize: 14 }}
              >
                Tulpiaan
              </div>
              <div
                className="text-tulpiaan-grijs"
                style={{ fontSize: 10 }}
              >
                Intaker Dashboard
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Menu sluiten"
            className="p-2 -mr-2 rounded hover:bg-tulpiaan-ivoor"
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
                  "flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors border-l-[3px] " +
                  (active
                    ? "bg-tulpiaan-ivoor text-tulpiaan-zwart font-medium border-tulpiaan-goud"
                    : "text-tulpiaan-zwart border-transparent hover:bg-tulpiaan-ivoor/60")
                }
              >
                <Icon
                  className={
                    "h-4 w-4 " +
                    (active ? "text-tulpiaan-zwart" : "text-tulpiaan-grijs")
                  }
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-black/[0.08] px-3 py-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-tulpiaan-goud text-white flex items-center justify-center font-semibold text-sm shrink-0">
            {initials(user.name, user.email)}
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="font-medium text-tulpiaan-zwart truncate"
              style={{ fontSize: 13 }}
            >
              {user.name ?? user.email ?? "Onbekend"}
            </div>
            {user.name && user.email && (
              <div
                className="text-tulpiaan-grijs truncate"
                style={{ fontSize: 11 }}
              >
                {user.email}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              aria-label="Instellingen"
              className="p-1.5 rounded text-tulpiaan-grijs hover:text-tulpiaan-zwart hover:bg-tulpiaan-ivoor transition-colors"
            >
              <Settings className="h-4 w-4" />
            </button>
            <form action={logoutAction}>
              <button
                type="submit"
                aria-label="Uitloggen"
                className="p-1.5 rounded text-tulpiaan-grijs hover:text-tulpiaan-zwart hover:bg-tulpiaan-ivoor transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
