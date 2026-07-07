import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grob - Deploy Your Apps",
  description: "Modern cloud deployment platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
