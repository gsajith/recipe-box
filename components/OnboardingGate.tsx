"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function OnboardingGate() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/onboarding") return;

    fetch("/api/users/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data?.username) {
          router.replace("/onboarding");
        }
      })
      .catch(() => {});
  }, [pathname]);

  return null;
}
