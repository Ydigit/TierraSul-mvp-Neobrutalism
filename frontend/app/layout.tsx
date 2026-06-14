import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { StoreProvider } from "@/lib/store";
import { ToastProvider } from "@/components/ui/toast";
import { BannedSentinel } from "@/components/auth/banned-sentinel";

const spaceGrotesk = localFont({
  src: "../public/fonts/space-grotesk.woff2",
  variable: "--font-space-grotesk",
  weight: "400 700",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TierraSul — Find your tribe. Travel together.",
  description:
    "Group-matching marketplace for backpackers in South America. Form tour groups, split costs, travel together.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body>
        <AuthProvider>
          <StoreProvider>
            <ToastProvider>
              <BannedSentinel />
              {children}
            </ToastProvider>
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
