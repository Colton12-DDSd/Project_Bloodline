import Link from "next/link";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" href="/">
          Project Bloodline
        </Link>
        <nav>
          <Link href="/">Stable</Link>
          <Link href="/breed">Breed</Link>
          <Link href="/genes">Genes</Link>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
