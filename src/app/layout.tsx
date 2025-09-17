import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Custom Caffe — Portail RH",
  description: "Prototype RH (mock) — Custom Caffe",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
