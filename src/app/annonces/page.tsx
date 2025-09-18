// src/app/annonces/page.tsx
'use client';
import Panel from "@/components/Panel";
import AuthGate from "@/components/AuthGate";
import { useDB } from "@/components/store";
import { useState } from "react";

export default function AnnoncesPage(){
  const { me, annonces, addAnnouncement } = useDB();
  const [title,setTitle]=useState("");
  const [content,setContent]=useState("");

  const canPost = me && (me.role==="manager" || me.role==="admin");

  return (
    <AuthGate>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        <Panel title="Publier" height="h-[1000px]">
          {canPost ? (
            <div className="space-y-4">
              <input
                className="px-4 py-3 rounded-lg border border-neutral-700 bg-[#0b0f15]"
                placeholder="Titre"
                value={title}
                onChange={e=>setTitle(e.target.value)}
              />
              <textarea
                className="min-h-[200px] px-4 py-3 rounded-lg border border-neutral-700 bg-[#0b0f15]"
                placeholder="Contenu"
                value={content}
                onChange={e=>setContent(e.target.value)}
              />
              <button
                onClick={()=>{
                  if(!title.trim() || !content.trim() || !me) return;
                  addAnnouncement(title.trim(), content.trim(), me.id);
                  setTitle(""); setContent("");
                }}
                className="px-6 py-3 rounded-lg bg-[#c7a27a] text-black font-semibold"
              >
                Publier
              </button>
            </div>
          ) : (
            <p className="text-neutral-400">Droits requis (manager/admin).</p>
          )}
        </Panel>

        <Panel title="Annonces" height="h-[1000px]">
          <div className="mt-4 flex-1 overflow-auto pr-2 space-y-5">
            {annonces.map(a=>(
              <article key={a.id} className="p-5 rounded-xl border border-neutral-700 bg-[#11151d]">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-lg">{a.title}</h3>
                  <time className="text-[12px] px-2 py-0.5 rounded-full bg-[#0b0f15] border border-neutral-700">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </time>
                </div>
                <p className="text-neutral-300 mt-1.5 whitespace-pre-wrap">{a.content}</p>
              </article>
            ))}
          </div>
        </Panel>
      </div>
    </AuthGate>
  );
}

