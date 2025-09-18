// src/app/layout.tsx
import "./globals.css";
import Link from "next/link";

export const metadata = { title: "Custom Caffe — Portail RH" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-[#0c0f14] text-neutral-100">
        <header className="border-b border-neutral-800 bg-[#0d1118] sticky top-0 z-40">
          <div className="mx-auto max-w-[1680px] h-16 px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/custom-caffe-logo.png" alt="Custom Caffe" width={36} height={36} className="rounded-full"/>
              <span className="text-lg font-semibold">Portal RH – Custom Caffe</span>
            </div>
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/" className="hover:underline">Accueil</Link>
              <Link href="/annonces" className="hover:underline">Annonces</Link>
              <Link href="/absences" className="hover:underline">Absences</Link>
              <Link href="/chat" className="hover:underline">Chat</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-[1680px] px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
