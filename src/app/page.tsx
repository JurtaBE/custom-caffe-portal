// src/app/page.tsx
'use client';
import Link from "next/link";
import Panel from "@/components/Panel";
import { useDB } from "@/components/store";
import { useState } from "react";

export default function Home() {
  const { me, login, logout } = useDB();
  const [email,setEmail]=useState(""); const [password,setPassword]=useState("");

  if(!me){
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <section className="w-full max-w-lg rounded-3xl border border-neutral-800 bg-[#0d1118] shadow-[0_10px_30px_rgba(0,0,0,.45)] overflow-hidden">
          <header className="px-7 py-7">
            <h1 className="text-3xl font-extrabold text-center">Connexion</h1>
          </header>
          <div className="px-7 pb-7 pt-1 border-t border-neutral-800 bg-[#0f1319] space-y-5">
            <div>
              <label className="text-sm text-neutral-300">Email</label>
              <input className="mt-1 w-full px-4 py-3 rounded-lg border border-neutral-700 bg-[#0b0f15]" value={email} onChange={e=>setEmail(e.target.value)} placeholder="employee@test.com"/>
            </div>
            <div>
              <label className="text-sm text-neutral-300">Mot de passe</label>
              <input type="password" className="mt-1 w-full px-4 py-3 rounded-lg border border-neutral-700 bg-[#0b0f15]" value={password} onChange={e=>setPassword(e.target.value)} placeholder="test123"/>
            </div>
            <button onClick={()=>{ try{login(email,password);}catch(e:any){alert(e.message);} }} className="w-full px-5 py-3 rounded-lg bg-[#c7a27a] text-black font-semibold">Entrer</button>
            <p className="text-xs text-neutral-500 text-center">Comptes: employee/manager/admin@test.com – mdp: test123</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <Panel title="Annonces" height="h-[380px]">
        <div className="flex-1 grid place-items-center">
          <Link href="/annonces" className="px-6 py-3 rounded-lg bg-[#c7a27a] text-black font-semibold">Ouvrir la page Annonces</Link>
        </div>
      </Panel>
      <Panel title="Absences" height="h-[380px]">
        <div className="flex-1 grid place-items-center">
          <Link href="/absences" className="px-6 py-3 rounded-lg bg-[#c7a27a] text-black font-semibold">Gérer les absences</Link>
        </div>
      </Panel>
      <Panel title="Chat" height="h-[380px]">
        <div className="flex-1 grid place-items-center">
          <Link href="/chat" className="px-6 py-3 rounded-lg bg-[#c7a27a] text-black font-semibold">Aller au chat</Link>
        </div>
      </Panel>
      <div className="col-span-full text-right">
        <button onClick={logout} className="px-4 py-2 rounded border border-neutral-700">Se déconnecter</button>
      </div>
    </div>
  );
}
