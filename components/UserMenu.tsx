"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { User, Settings, LogOut, ChevronDown, Home, Users } from "lucide-react";
import Link from "next/link";
import styles from "./UserMenu.module.css";

export function UserMenu() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((data) => {
        if (data?.username) setUsername(data.username);
        if (data?.display_name) setDisplayName(data.display_name);
      })
      .catch(() => {});
  }, []);

  if (!user) {
    return (
      <a href="/sign-in" className={styles.signInLink}>
        Sign in
      </a>
    );
  }

  const name = displayName || username || "Account";
  const profileHref = username ? `/user/${username}` : "/onboarding";
  const isOnProfile = username ? pathname === `/user/${username}` : false;

  return (
    <div className={styles.container} ref={ref}>
      <button
        className={styles.trigger}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true">
        <img src={user.imageUrl} alt={name} className={styles.avatar} />
        Hi,&nbsp;<span className={styles.name}>{name}</span>!
        <ChevronDown
          size={13}
          className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
        />
      </button>

      {open && (
        <div className={styles.dropdown} role="menu">
          <Link
            href={`/`}
            className={`${styles.item} ${pathname === "/" ? styles.itemActive : ""}`}
            onClick={() => setOpen(false)}>
            <Home size={15} />
            Home
          </Link>
          <Link
            href={profileHref}
            className={`${styles.item} ${isOnProfile ? styles.itemActive : ""}`}
            onClick={() => setOpen(false)}>
            <User size={15} />
            Profile
          </Link>
          <Link
            href="/users"
            className={`${styles.item} ${pathname === "/users" ? styles.itemActive : ""}`}
            onClick={() => setOpen(false)}>
            <Users size={15} />
            User list
          </Link>
          <Link
            href="/settings"
            className={`${styles.item} ${pathname === "/settings" ? styles.itemActive : ""}`}
            onClick={() => setOpen(false)}>
            <Settings size={15} />
            Settings
          </Link>
          <div className={styles.divider} />
          <button
            className={`${styles.item} ${styles.signOut}`}
            onClick={() => signOut(() => router.push("/"))}>
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
