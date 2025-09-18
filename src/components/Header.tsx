// src/components/Header.tsx
'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDB } from "@/components/store";

export default function Header() {
  const { me } = useDB();
  const pathname = usePathname();

  // ➜ Masquer totalement le header sur la page de login quand on n'est pas connecté
  if (!me && pathname === "/") return null;

  return (
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
  );
}
