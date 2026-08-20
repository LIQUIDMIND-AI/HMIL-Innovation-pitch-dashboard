import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { VehicleStoreProvider } from "@/lib/store";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/** Display serif — page titles, the login headline and KPI numbers only. Never body, tables or buttons. */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

/** Data face — VINs, chassis numbers, amounts, timestamps, journey-rail stage labels. */
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DhanFlow — Invoice-to-Delivery Visibility",
    template: "%s",
  },
  description:
    "DhanFlow: invoice-to-delivery visibility platform for Hyundai Motor India (HMIL).",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} ${plexMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-canvas text-ink">
        <AuthProvider>
          <VehicleStoreProvider>{children}</VehicleStoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
