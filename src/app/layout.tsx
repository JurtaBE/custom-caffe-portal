// src/app/layout.tsx
import "./globals.css";
import Header from "@/components/Header";

export const metadata = { title: "Custom Caffe — Portail RH" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-[#0c0f14] text-neutral-100">
        {/* ➜ Le header se cache tout seul si non connecté sur "/" */}
        <Header />
        <main className="mx-auto max-w-[1680px] px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
