// src/app/chat/page.tsx
'use client';
import Panel from "@/components/Panel";
import { GROUP_DIRECTION, FileMeta, useDB } from "@/components/store";
import { useEffect, useMemo, useRef, useState } from "react";

export default function ChatPage(){
  const { me, users, dms, sendDM, unread, resetUnread } = useDB();
  const isDirection = me && (me.role==="admin" || me.role==="manager");

  // Contacts (canal groupe + 1:1 en fonction du rôle)
  const partners = useMemo(()=>{
    const list: {id:string; label:string; sub?:string; isGroup?:boolean}[] = [];
    list.push({id:GROUP_DIRECTION, label:"Direction (groupe)", isGroup:true});
    if(me?.role==="employee"){
      users.filter(u=>u.role==="manager"||u.role==="admin").forEach(u=>list.push({id:u.id,label:u.name,sub:u.role}));
    } else if(isDirection){
      users.filter(u=>u.role==="employee").forEach(u=>list.push({id:u.id,label:u.name,sub:"employee"}));
    }
    return list;
  },[users,me,isDirection]);

  const [peerId,setPeerId]=useState<string|undefined>(partners[0]?.id);
  useEffect(()=>{ if(!peerId && partners[0]) setPeerId(partners[0].id); },[partners,peerId]);

  const thread = useMemo(()=>{
    if(!me || !peerId) return [];
    if(peerId===GROUP_DIRECTION){
      return dms.filter(m=>m.toUserId===GROUP_DIRECTION).sort((a,b)=>+new Date(a.createdAt)-+new Date(b.createdAt));
    }
    return dms
      .filter(m=>(m.fromUserId===me.id&&m.toUserId===peerId)||(m.fromUserId===peerId&&m.toUserId===me.id))
      .sort((a,b)=>+new Date(a.createdAt)-+new Date(b.createdAt));
  },[dms,me,peerId]);

  // Unread reset à l’ouverture
  useEffect(()=>{ if(peerId) resetUnread(peerId); },[peerId]);

  // Notifications navigateur
  const enableNotif = async ()=>{
    try { await Notification.requestPermission(); alert("Notifications activées (si autorisées)."); }
    catch { alert("Notifications bloquées."); }
  };

  const [draft,setDraft]=useState(""); const [files,setFiles]=useState<FileList|null>(null);
  const endRef=useRef<HTMLDivElement|null>(null);
  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:"smooth"}); },[thread.length]);

  const send = ()=>{
    if(!me || !peerId) return;
    if(!draft.trim() && (!files || files.length===0)) return;
    const metas: FileMeta[]|undefined = files && files.length>0
      ? Array.from(files).map(f=>({ name:f.name, type:f.type, size:f.size, url:URL.createObjectURL(f) }))
      : undefined;
    sendDM(me.id, peerId, draft.trim(), metas);
    setDraft(""); setFiles(null);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-10">
      <Panel title="Contacts" height="h-[1000px]">
        <div className="flex justify-between items-center">
          <button onClick={enableNotif} className="px-3 py-2 rounded border border-neutral-700 text-sm">Activer les notifications</button>
          <span className="text-xs text-neutral-500">les messages groupe “Direction” notifient tout le staff Direction</span>
        </div>
        <div className="mt-5 flex-1 overflow-auto pr-2 space-y-4">
          {partners.map(p=>{
            const sel=p.id===peerId; const badge = unread[p.id]||0;
            return (
              <button key={p.id}
                className={`w-full text-left p-4 rounded-xl border transition ${sel?"bg-[#141923] border-neutral-600":"bg-[#0b0f15] border-neutral-800 hover:border-neutral-600"}`}
                onClick={()=>setPeerId(p.id)}>
                <div className="flex items-center gap-3">
                  <span className="h-9 w-9 rounded-full bg-[#141923] border border-neutral-700 flex items-center justify-center text-xs">
                    {p.isGroup ? "DR" : p.label.slice(0,2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold truncate">{p.label}</span>
                      {p.isGroup ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-700">groupe</span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-900/40 text-green-300 border border-green-700">en ligne</span>
                      )}
                      {!!badge && <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-red-900/40 text-red-300 border border-red-700">{badge}</span>}
                    </div>
                    {p.sub && <span className="text-xs text-neutral-400">{p.sub}</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </Panel>

      <Panel title="Messages" height="h-[1000px]">
        <div className="flex-1 overflow-auto pr-1 space-y-4">
          {thread.map(m=>{
            const mine = m.fromUserId===me?.id;
            const u = users.find(x=>x.id===m.fromUserId);
            return (
              <div key={m.id} className={`flex ${mine?"justify-end":"justify-start"}`}>
                <div className={`max-w-[82%] px-4 py-3 rounded-2xl border text-[15px] leading-relaxed
                  ${mine?"bg-[#c7a27a] text-black border-[#c7a27a]":"bg-[#11151d] text-neutral-200 border-neutral-700"}`}>
                  {!mine && <div className="text-[12px] font-medium mb-0.5 text-neutral-300">{u?.name}</div>}
                  {m.text && <div className="whitespace-pre-wrap break-words">{m.text}</div>}
                  {m.files && m.files.length>0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {m.files.map((f,i)=>(
                        f.type.startsWith("image/")
                          ? <img key={i} src={f.url} alt={f.name} className="h-24 rounded-lg border border-neutral-700" />
                          : <a key={i} href={f.url} download={f.name} className="text-[12px] px-2 py-1 rounded border border-neutral-700 bg-[#0b0f15] underline">
                              {f.name} ({Math.round(f.size/1024)} Ko)
                            </a>
                      ))}
                    </div>
                  )}
                  <div className="text-[11px] mt-1 text-neutral-400">{new Date(m.createdAt).toLocaleTimeString()}</div>
                </div>
              </div>
            );
          })}
          <div ref={endRef}/>
          {!thread.length && <div className="text-sm text-neutral-500">Aucun message ici pour l’instant.</div>}
        </div>

        <form className="mt-4 flex flex-col gap-2" onSubmit={(e)=>{e.preventDefault();send();}}>
          <div className="flex items-center gap-3">
            <input className="flex-1 px-4 py-3 rounded-lg border border-neutral-700 bg-[#0b0f15]"
              placeholder={peerId===GROUP_DIRECTION ? "Message au groupe Direction…" : "Votre message…"}
              value={draft} onChange={e=>setDraft(e.target.value)} />
            <label className="px-3 py-3 rounded-lg border border-neutral-700 bg-[#0b0f15] cursor-pointer text-sm">
              📎
              <input type="file" multiple className="hidden" onChange={e=>setFiles(e.target.files)} />
            </label>
            <button type="submit" className="px-5 py-3 rounded-lg bg-[#c7a27a] text-black font-semibold disabled:opacity-50"
              disabled={!draft.trim() && (!files || files.length===0)}>Envoyer</button>
          </div>
          {files && files.length>0 && (
            <div className="text-xs text-neutral-400 flex flex-wrap gap-2">
              {Array.from(files).map((f,i)=><span key={i} className="px-2 py-1 rounded bg-[#141923] border border-neutral-700">{f.name}</span>)}
            </div>
          )}
        </form>
      </Panel>
    </div>
  );
}
