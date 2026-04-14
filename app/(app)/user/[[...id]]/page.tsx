"use client";
import { useUser } from "@clerk/nextjs";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  return (
    <div>
      hiii {isLoaded} {user && user.fullName}
    </div>
  );
}
