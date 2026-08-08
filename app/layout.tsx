import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

// Playfair Display is a variable font (wght 400–900), so no `weight` is passed:
// the array form is for non-variable families and would pin us to static cuts,
// which is what left the profile page's 900 declarations resolving to 800.
const playfairDisplay = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://recipe-box-gs.vercel.app"
  ),
  title: "RecipeBox",
  // The marketing line was in the OG tag while the template line was here.
  description:
    "Share any link from Instagram, YouTube, or a recipe site and it's saved — photo, cook time and source already filled in.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "RecipeBox",
    description: "Every recipe you love, beautifully saved.",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "https://recipe-box-gs.vercel.app",
    siteName: "RecipeBox",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RecipeBox",
    description: "Every recipe you love, beautifully saved.",
  },
  other: {
    "theme-color": "#234b39",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "RecipeBox",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfairDisplay.variable} ${dmSans.variable}`}>
      <body>
        {/* @ts-ignore Providers is an async server component */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
