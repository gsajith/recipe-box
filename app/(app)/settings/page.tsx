"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ProfileForm } from "@/components/ProfileForm";
import styles from "./page.module.css";

function SettingsContent() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const [initialUsername, setInitialUsername] = useState("");
  const [initialDisplayName, setInitialDisplayName] = useState("");
  const [savedUsername, setSavedUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((data) => {
        if (data?.username) {
          setInitialUsername(data.username);
          setSavedUsername(data.username);
        }
        if (data?.display_name) setInitialDisplayName(data.display_name);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {errorParam === "username-required" && (
        <p className={styles.errorBanner}>
          You need to set a username before you can view your profile.
        </p>
      )}

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Public profile</h2>

        <ProfileForm
          initialUsername={initialUsername}
          initialDisplayName={initialDisplayName}
          submitLabel="Save"
          loading={loading}
          onSuccess={(data) => {
            setInitialUsername(data.username ?? "");
            setInitialDisplayName(data.display_name ?? "");
            setSavedUsername(data.username ?? "");
            setSaved(true);
          }}
          footer={
            saved && (
              <p className={styles.successMsg}>
                Profile saved!{" "}
                {savedUsername && (
                  <Link
                    href={`/user/${savedUsername}`}
                    className={styles.profileLink}>
                    View your profile →
                  </Link>
                )}
              </p>
            )
          }
        />
      </div>
    </>
  );
}

export default function SettingsPage() {
  return (
    <div className={styles.page}>
      <Suspense>
        <SettingsContent />
      </Suspense>
    </div>
  );
}
