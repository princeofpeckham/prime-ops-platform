import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PRIME Ops Platform",
  description: "Operations console for Appear Here PRIME spaces"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
