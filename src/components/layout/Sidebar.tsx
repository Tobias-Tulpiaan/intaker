import { auth } from "@/auth";
import { SidebarShell } from "./SidebarShell";

export async function Sidebar() {
  const session = await auth();
  const user = session?.user;

  return (
    <SidebarShell
      user={{ name: user?.name ?? null, email: user?.email ?? null }}
    />
  );
}
