import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Saanvika Solar Marketing Agent",
  description:
    "Create Instagram, WhatsApp, ads, and campaign content for Saanvika Solar Systems (@saanvika_solar).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
