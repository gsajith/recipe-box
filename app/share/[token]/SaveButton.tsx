"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import styles from "./page.module.css";

interface SaveButtonProps {
  token: string;
}

export function SaveButton({ token }: SaveButtonProps) {
  const router = useRouter();
  const { user } = useUser();
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error" | "duplicate">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSave = async () => {
    if (!user) {
      router.push(`/sign-in?redirect_url=/share/${token}`);
      return;
    }

    setStatus("saving");
    try {
      const res = await fetch(`/api/share/${token}/save`, { method: "POST" });
      if (res.ok) {
        setStatus("saved");
        setTimeout(() => router.push("/"), 1200);
      } else {
        const data = await res.json();
        if (data.error?.toLowerCase().includes("already")) {
          setStatus("duplicate");
        } else {
          setErrorMsg(data.error ?? "Failed to save");
          setStatus("error");
        }
      }
    } catch {
      setErrorMsg("Something went wrong");
      setStatus("error");
    }
  };

  if (status === "saved") {
    return (
      <div className={styles.savedMsg}>
        Saved! Taking you to your recipes…
      </div>
    );
  }

  if (status === "duplicate") {
    return (
      <div className={styles.duplicateMsg}>
        You already have this recipe saved.{" "}
        <a href="/" className={styles.goHomeLink}>Go to your recipes →</a>
      </div>
    );
  }

  return (
    <div className={styles.saveArea}>
      <button
        onClick={handleSave}
        className={styles.saveBtn}
        disabled={status === "saving"}>
        {status === "saving"
          ? "Saving…"
          : user
          ? "Save to my recipes"
          : "Sign in to save"}
      </button>
      {status === "error" && (
        <p className={styles.errorMsg}>{errorMsg}</p>
      )}
    </div>
  );
}
