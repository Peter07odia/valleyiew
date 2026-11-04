import type { Metadata } from "next";
import "@fontsource-variable/manrope";
import "@fontsource-variable/newsreader";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { RouteChatWidget } from "@/components/layout/route-chat-widget";
import { MobileClinicBar } from "@/components/layout/mobile-clinic-bar";
import { MobileClinicSheet } from "@/components/layout/mobile-clinic-sheet";
import { PreferredLocationProvider } from "@/components/providers/preferred-location-provider";
import { AuthHashHandler } from "@/components/providers/auth-hash-handler";
import {
  CLINIC_CONFIG,
  getConfiguredSiteUrl,
  searchIndexingAllowed,
} from "@/config/clinic";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Valleyview Medical Centre",
    template: "%s | Valleyview Medical Centre",
  },
  description:
    "Family medicine across seven clinics in Durham Region, Peterborough and Brantford. Find your clinic, meet our doctors, register or book through Ocean.",
  keywords: [
    "Valleyview Medical Centre",
    "Brantford",
    "Lynden Road",
    "Colborne Street East",
    "medical centre",
  ],
  metadataBase: getConfiguredSiteUrl(),
  verification: { google: "FTjiSSbfjJleLhIi6s-hgnqCBF8_MPw4-83VDkhzRbs" },
  robots: searchIndexingAllowed()
    ? { index: true, follow: true }
    : { index: false, follow: false },
  openGraph: {
    type: "website",
    locale: "en_CA",
    siteName: CLINIC_CONFIG.siteName,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="min-h-dvh flex flex-col antialiased"
        suppressHydrationWarning
      >
        <noscript>
          <style>{"[data-reveal]{opacity:1!important}"}</style>
        </noscript>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <PreferredLocationProvider>
            <TooltipProvider>
              <AuthHashHandler />
              {children}
              <MobileClinicBar />
              <MobileClinicSheet />
              {CLINIC_CONFIG.aiChat.enabled ? <RouteChatWidget /> : null}
              <Toaster />
            </TooltipProvider>
          </PreferredLocationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
