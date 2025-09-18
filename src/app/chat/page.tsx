// src/app/chat/page.tsx
'use client';
import Panel from "@/components/Panel";
import AuthGate from "@/components/AuthGate";
import { useDB, GROUP_DIRECTION } from "@/components/store";
import { useEffect, useMemo, useRef, useState } from "react";

export default function ChatPage(){
  const { me, users, dms, sendDM, resetUnread } = useDB();
  const [selected, setSelected] = useState<string|null>(null);
  const [text,setText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Liste des destinataires (tous sauf soi)
  const partners = useMemo(()=>users.filter(u=>u.id!==me?.id),[users,me]);

  // Fil de conversation pour l'utilisateur sélectionné
  const currentThread = useMemo(()=>{
    if(!me || !selected) return [];
    return dms.filter(m=>
      (m.fromUserId===me.id && m.toUserId===selected) ||
      (m.fromUserId===selected && m.toUserId===me.id) ||
      (selected===GROUP_DIRECTION && m.toUserId===GROUP_DIRECTION)
    );
  },[dms,selected,me]);

  useEffect(()=>{
    if(selected) resetUnread(selected);
  },[selected,resetUnread]);

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[currentThread]);

  return (
    <AuthGate>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <Panel title="Contacts" height="h-[1000px]">
          <ul className="space-y-2">
            <li>
              <button
                onClick={()=>setSelected(GROUP_DIRECTION)}
                className={`w-full text-left px-3 py-2 rounded border ${selected===GROUP_DIRECTION?"bg-[#141923] border-[#c7a27a]":"border-neutral-700"}`}
              >
                <strong>Direction (Groupe)</strong>
              </button>
            </li>
            {partners.map(u=>(
              <li key={u.id}>
                <button
                  onClick={()=>setSelected(u.id)}
                  className={`w-full text-left px-3 py-2 rounded border ${selected===u.id?"bg-[#141923] border-[#c7a27a]":"border-neutral-700"}`}
                >
                  {u.name} <span className="text-xs text-neutral-400">({u.role})</span>
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title={selected?`Conversation`:`Sélectionnez un contact`} className="xl:col-span-2" height="h-[1000px]">
          {selected ? (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-auto space-y-3">
                {currentThread.map(m=>{
                  const mine = m.fromUserId===me?.id;
                  const sender = users.find(u=>u.id===m.fromUserId);
                  return (
                    <div key={m.id} className={`flex ${mine?"justify-end":"justify-start"}`}>
                      <div className={`max-w-[75%] px-3 py-2 rounded-xl border ${mine?"bg-[#c7a27a] text-black border-[#c7a27a]":"bg-[#11151d] text-neutral-200 border-neutral-700"}`}>
                        {!mine && <div className="text-xs font-semibold mb-1">{sender?.name}</div>}
                        <div>{m.text}</div>
                        <div className="text-[10px] mt-1 opacity-70">{new Date(m.createdAt).toLocaleTimeString()}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef}></div>
              </div>

              <form
                onSubmit={e=>{e.preventDefault(); if(!text.trim()||!me) return;
                  sendDM(me.id, selected!, text.trim()); setText("");}}
                className="mt-4 flex items-center gap-3"
              >
                <input
                  className="flex-1 px-4 py-3 rounded-lg border border-neutral-700 bg-[#0b0f15]"
                  placeholder="Votre message…"
                  value={text}
                  onChange={e=>setText(e.target.value)}
                />
                <button type="button" onClick={()=>fileInputRef.current?.click()} className="px-3 py-2 rounded-lg border border-neutral-700">📎</button>
                <button type="submit" className="px-5 py-3 rounded-lg bg-[#c7a27a] text-black font-semibold">Envoyer</button>
                <input type="file" ref={fileInputRef} hidden multiple />
              </form>
            </div>
          ) : (
            <p className="text-neutral-400">Choisissez un contact à gauche.</p>
          )}
        </Panel>
      </div>
    </AuthGate>
  );
}
