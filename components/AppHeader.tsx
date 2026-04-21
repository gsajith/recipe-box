"use client";

import Link from "next/link";
import { UserMenu } from "./UserMenu";
import { NotificationPanel } from "./NotificationPanel";
import styles from "./AppHeader.module.css";

export function AppHeader() {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        <em>
          Recipe<b>Box</b>
        </em>
      </Link>
      <div className={styles.right}>
        <NotificationPanel />
        <UserMenu />
      </div>
    </header>
  );
}
