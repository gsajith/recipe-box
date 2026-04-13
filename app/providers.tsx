import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";

interface ProvidersProps {
  children: ReactNode;
}

export async function Providers({ children }: ProvidersProps) {
  return (
    // @ts-ignore
    <ClerkProvider>{children}</ClerkProvider>
  );
}
