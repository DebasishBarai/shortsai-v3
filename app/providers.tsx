"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from 'sonner';
import { ConvexProvider, ConvexReactClient } from "convex/react";

export const Providers = ({ children }: { children: React.ReactNode }) => {

  const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

  return (
    <>
      <ConvexProvider client={convex}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Toaster />
      </ConvexProvider>
    </>
  );
};
