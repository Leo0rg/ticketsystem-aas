"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { TRPCProvider } from "./trpc-provider";

export function Providers({ children }: React.PropsWithChildren) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider>
        <TRPCProvider>{children}</TRPCProvider>
      </SessionProvider>
    </ThemeProvider>
  );
} 