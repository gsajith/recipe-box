import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return <ClerkProvider>{children}</ClerkProvider>;
}
