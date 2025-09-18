// src/components/NavBar.tsx
'use client';

import Link from "next/link";
import { useDB } from "./store";

export default function NavBar() {
  const { me, logout } = useDB();
  if (!me) return null; // 🔒 rien tant qu'on n'est pas connecté

  const isDirection = me.role === "manager" || me.role === "admin";

  return (
    <div className="flex items-center gap-6 text-sm">
      {isDirection && <Link href="/annonces" className="hover:underline">Annonces</Link>}
      <Link href="/absences" className="hover:underline">Absences</Link>
      <Link href="/chat" className="hover:underline">Chat</Link>

      <span className="mx-2 h-5 w-px bg-neutral-700 inline-block" />
      <span className="text-[12px] px-2 py-0.5 rounded-full bg-[#0b0f15] border border-neutral-700 capitalize">
        {me.role}
      </span>
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-[#141923] border border-neutral-700 flex items-center justify-center text-xs">
          {me.name.slice(0,2).toUpperCase()}
        </div>
        <span className="text-sm">{me.name}</span>
      </div>
      <button onClick={logout} className="p-2 rounded hover:bg-[#141923]" title="Se déconnecter">⎋</button>
    </div>
  );
}
