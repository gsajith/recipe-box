"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { UserMenu } from "./UserMenu";
import { NotificationPanel } from "./NotificationPanel";
import styles from "./AppHeader.module.css";

const LINKS = [
  { href: "/", label: "Recipes" },
  { href: "/users", label: "People" },
];

export function AppHeader() {
  const pathname = usePathname();
  const { isSignedIn } = useUser();

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        <em>
          Recipe<b>Box</b>
        </em>
      </Link>

      {/* Destinations were only reachable through a dropdown labelled with the
          user's own name, so there was no way to see where you were. */}
      {isSignedIn && (
        <nav className={styles.nav} aria-label="Main">
          {LINKS.map(({ href, label }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}>
                {label}
              </Link>
            );
          })}
        </nav>
      )}

      <div className={styles.right}>
        <NotificationPanel />
        <UserMenu />
      </div>
    </header>
  );
}
