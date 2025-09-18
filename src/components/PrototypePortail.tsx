'use client';
import { useMemo, useState, useEffect, useRef } from "react";

/* ========= Types ========= */
type Role = "employee" | "manager" | "admin";
interface UserT { id:string; email:string; name:string; role:Role; active?:boolean }
interface AnnouncementT { id:string; title:string; content:string; createdBy:string; createdAt:string }
interface AbsenceT {
  id:string; userId:string; type:string; from:string; to:string; reason:string;
  status:"en_attente"|"approuvée"|"refusée"; decidedBy?:string; decidedAt?:string
}
interface DM { id:string; fromUserId:string; toUserId:string; text:string; createdAt:string }

const nowISO = () => new Date().toISOString();
const rid = () => Math.random().toString(36).slice(2,10);

/* ========= Seed ========= */
const seedUsers:UserT[] = [
  {id:"u1", email:"employee@test.com", name:"Alice Martin",  role:"employee", active:true},
  {id:"u2", email:"manager@test.com",  name:"Bruno Lefevre", role:"manager",  active:true},
  {id:"u3", email:"admin@test.com",    name:"Chloé Dubois",  role:"admin",    active:true},
  {id:"u4", email:"paul@exemple.com",  name:"Paul Noël",     role:"employee", active:true},
];

/* ========= App ========= */
export default function PrototypePortail() {
  /* Auth (mock) */
  const [email,setEmail]=useState(""); const [password,setPassword]=useState("");
  const [me,setMe]=useState<UserT|null>(null);
  const [users]=useState<UserT[]>(seedUsers);

  const login=()=>{ const u=users.find(x=>x.email.toLowerCase()===email.toLowerCase()); if(!u){alert("Email inconnu.");return;} setMe(u); };
  const logout=()=>setMe(null);

  const role:Role|null=me?.role??null, isAdmin=role==="admin", isManager=role==="manager", isEmployee=role==="employee";

  /* Annonces */
  const [annonces,setAnnonces]=useState<AnnouncementT[]>([
    {id:rid(),title:"Nouvelle charte sécurité",content:"Casques obligatoires en zone A.",createdBy:"u3",createdAt:nowISO()},
    {id:rid(),title:"Prime de performance",content:"Versement prévu fin du mois.",createdBy:"u2",createdAt:nowISO()},
  ]);
  const [newAnn,setNewAnn]=useState({title:"",content:""});
  const publish=()=>{ if(!me) return; if(!newAnn.title.trim()||!newAnn.content.trim()) return;
    setAnnonces(p=>[{id:rid(),title:newAnn.title,content:newAnn.content,createdBy:me.id,createdAt:nowISO()},...p]);
    setNewAnn({title:"",content:""});
  };

  /* Absences */
  const [absences,setAbsences]=useState<AbsenceT[]>([
    {id:rid(),userId:"u1",type:"Maladie",from:"2025-09-18",to:"2025-09-25",reason:"",status:"en_attente"},
    {id:rid(),userId:"u1",type:"CP",from:"2025-09-22",to:"2025-09-24",reason:"Vacances",status:"en_attente"},
    {id:rid(),userId:"u4",type:"RTT",from:"2025-09-19",to:"2025-09-19",reason:"RDV médical",status:"en_attente"},
  ]);
  const [newAbs,setNewAbs]=useState({type:"CP",from:"",to:"",reason:""});
  const requestAbs=()=>{ if(!me) return; if(!newAbs.from||!newAbs.to) return;
    setAbsences(p=>[{id:rid(),userId:me.id,type:newAbs.type,from:newAbs.from,to:newAbs.to,reason:newAbs.reason,status:"en_attente"},...p]);
    setNewAbs({type:"CP",from:"",to:"",reason:""});
  };

  /* Validation au nom de */
  const direction=useMemo(()=>users.filter(u=>u.role==="manager"||u.role==="admin"),[users]);
  const [deciderId,setDeciderId]=useState<string|undefined>(direction[0]?.id);
  useEffect(()=>{ if(!deciderId && direction[0]) setDeciderId(direction[0].id); },[direction,deciderId]);
  const decide=(id:string, s:"approuvée"|"refusée")=>{
    if(!(isAdmin||isManager)) return;
    const d = users.find(u=>u.id===deciderId) ?? me ?? undefined;
    setAbsences(p=>p.map(a=>a.id===id?{...a,status:s,decidedBy:d?.id,decidedAt:nowISO()}:a));
  };

  /* Chat 1-1 */
  const [dm,setDm]=useState<DM[]>([
    {id:rid(),fromUserId:"u1",toUserId:"u2",text:"Peut-on avoir des gants taille S ?",createdAt:nowISO()},
    {id:rid(),fromUserId:"u2",toUserId:"u1",text:"Brief sécurité demain 8h.",createdAt:nowISO()},
  ]);
  const partners = useMemo(()=>{
    if(isEmployee) return direction;
    if(isManager||isAdmin) return users.filter(u=>u.role==="employee");
    return [];
  },[isEmployee,isManager,isAdmin,users,direction]);
  const [peerId,setPeerId]=useState<string|undefined>(partners[0]?.id);
  useEffect(()=>{ if(!peerId && partners[0]) setPeerId(partners[0].id); },[partners,peerId]);

  const thread = useMemo(()=>!me||!peerId?[]:
    dm.filter(m=>(m.fromUserId===me.id&&m.toUserId===peerId)||(m.fromUserId===peerId&&m.toUserId===me.id))
      .sort((a,b)=>+new Date(a.createdAt)-+new Date(b.createdAt))
  ,[dm,me,peerId]);
  const [draft,setDraft]=useState(""); const endRef=useRef<HTMLDivElement|null>(null);
  const send=()=>{ if(!me||!peerId||!draft.trim()) return; setDm(p=>[...p,{id:rid(),fromUserId:me.id,toUserId:peerId,text:draft.trim(),createdAt:nowISO()}]); setDraft(""); };
  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:"smooth"}); },[thread.length]);

  /* Dérivés */
  const pending=useMemo(()=>absences.filter(a=>a.status==="en_attente"),[absences]);

  /* ===== UI ===== */
  return (
    <div className="min-h-screen text-neutral-100" style={{background:"#0c0f14"}}>
      <TopBar me={me} role={role} logout={logout}/>

      {/* Connexion centrée plein écran */}
      {!me ? (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6">
          <section className="w-full max-w-md rounded-3xl border border-neutral-800 bg-[#0d1118] shadow-[0_10px_30px_rgba(0,0,0,.45)] overflow-hidden">
            <header className="px-6 py-6">
              <h1 className="text-2xl font-extrabold tracking-wide text-center">Connexion</h1>
            </header>
            <div className="px-6 pb-6 pt-1 border-t border-neutral-800 bg-[#0f1319] space-y-4">
              <div>
                <label className="text-sm text-neutral-300">Email</label>
                <input className="mt-1 w-full px-4 py-3 rounded-lg border border-neutral-700 bg-[#0b0f15]"
                       value={email} onChange={e=>setEmail(e.target.value)} placeholder="votre@email.com"/>
              </div>
              <div>
                <label className="text-sm text-neutral-300">Mot de passe <span className="text-neutral-500">(mock)</span></label>
                <input type="password" className="mt-1 w-full px-4 py-3 rounded-lg border border-neutral-700 bg-[#0b0f15]"
                       value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"/>
              </div>
              <button className="w-full px-5 py-3 rounded-lg bg-[#c7a27a] text-black font-semibold" onClick={login}>Entrer</button>
              <p className="text-xs text-neutral-500 text-center">Astuce : employee@test.com, manager@test.com ou admin@test.com</p>
            </div>
          </section>
        </div>
      ) : (
        <main className="mx-auto max-w-[1440px] px-6 py-10">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Annonces */}
            <Panel title="ANNONCES">
              {(isAdmin||isManager) && (
                <div className="p-4 rounded-2xl border border-neutral-700 bg-[#11151d]">
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
                    <input className="px-4 py-3 rounded-lg border border-neutral-700 bg-[#0b0f15]" placeholder="Titre"
                      value={newAnn.title} onChange={e=>setNewAnn({...newAnn,title:e.target.value})}/>
                    <button onClick={publish} className="px-5 py-3 rounded-lg bg-[#c7a27a] text-black font-semibold hover:brightness-110">Publier</button>
                    <textarea className="sm:col-span-2 min-h-[100px] px-4 py-3 rounded-lg border border-neutral-700 bg-[#0b0f15]" placeholder="Contenu"
                      value={newAnn.content} onChange={e=>setNewAnn({...newAnn,content:e.target.value})}/>
                  </div>
                </div>
              )}
              <Scroller>
                {annonces.map(a=>(
                  <article key={a.id} className="p-4 rounded-xl border border-neutral-700 bg-[#11151d]">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-lg">{a.title}</h3>
                      <time className="text-[12px] px-2 py-0.5 rounded-full bg-[#0b0f15] border border-neutral-700">{new Date(a.createdAt).toLocaleDateString()}</time>
                    </div>
                    <p className="text-neutral-300 mt-1.5">{a.content}</p>
                  </article>
                ))}
              </Scroller>
            </Panel>

            {/* Absences */}
            <Panel title="ABSENCES">
              {isEmployee && (
                <div className="p-4 rounded-2xl border border-neutral-700 bg-[#11151d] space-y-3">
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                    <select className="px-3 py-3 rounded-lg border border-neutral-700 bg-[#0b0f15]" value={newAbs.type} onChange={e=>setNewAbs({...newAbs,type:e.target.value})}>
                      <option>CP</option><option>RTT</option><option>Maladie</option>
                    </select>
                    <input type="date" className="px-3 py-3 rounded-lg border border-neutral-700 bg-[#0b0f15]" value={newAbs.from} onChange={e=>setNewAbs({...newAbs,from:e.target.value})}/>
                    <input type="date" className="px-3 py-3 rounded-lg border border-neutral-700 bg-[#0b0f15]" value={newAbs.to} onChange={e=>setNewAbs({...newAbs,to:e.target.value})}/>
                    <div className="lg:col-span-2 flex justify-end">
                      <button onClick={requestAbs} className="px-5 py-3 rounded-lg bg-[#c7a27a] text-black font-semibold hover:brightness-110">Demander</button>
                    </div>
                  </div>
                  <textarea className="w-full min-h-[90px] px-4 py-3 rounded-lg border border-neutral-700 bg-[#0b0f15]" placeholder="Motif (optionnel)"
                    value={newAbs.reason} onChange={e=>setNewAbs({...newAbs,reason:e.target.value})}/>
                </div>
              )}

              {(isManager||isAdmin) && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h4 className="font-semibold text-lg">Demandes en attente</h4>
                    <span className="text-[12px] px-2 py-0.5 rounded-full bg-[#0b0f15] border border-neutral-700">
                      {pending.length}
                    </span>
                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-sm text-neutral-300">Valider au nom de</span>
                      <select className="px-3 py-2 rounded-lg border border-neutral-700 bg-[#0b0f15]" value={deciderId} onChange={e=>setDeciderId(e.target.value)}>
                        {direction.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-neutral-700 overflow-hidden relative z-10">
                    <table className="w-full text-sm">
                      <thead className="bg-[#141923] text-neutral-200">
                        <tr className="text-left">
                          <th className="p-3">Employé</th><th className="p-3">Type</th><th className="p-3">Du</th><th className="p-3">Au</th><th className="p-3">Motif</th><th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pending.map(a=>{
                          const u=users.find(x=>x.id===a.userId);
                          return (
                            <tr key={a.id} className="border-t border-neutral-800 bg-[#0b0f15]">
                              <td className="p-3 font-medium">{u?.name}</td>
                              <td className="p-3">{a.type}</td>
                              <td className="p-3">{a.from}</td>
                              <td className="p-3">{a.to}</td>
                              <td className="p-3 max-w-[260px] truncate" title={a.reason}>{a.reason||"—"}</td>
                              <td className="p-3 text-right space-x-2">
                                <button onClick={()=>decide(a.id,"refusée")}  className="px-3 py-1.5 rounded-lg border border-neutral-600 hover:bg-[#151b25] relative z-20">Refuser</button>
                                <button onClick={()=>decide(a.id,"approuvée")} className="px-3 py-1.5 rounded-lg bg-[#c7a27a] text-black font-semibold hover:brightness-110 relative z-20">Approuver</button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-semibold text-lg">Suivi</h4>
                <div className="rounded-2xl border border-neutral-700 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-[#141923] text-neutral-200">
                      <tr className="text-left">
                        <th className="p-3">Employé</th><th className="p-3">Type</th><th className="p-3">Période</th><th className="p-3">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {absences.map(a=>{
                        const u=users.find(x=>x.id===a.userId);
                        const statusCls = a.status==="approuvée"?"bg-green-900/40 text-green-300 border-green-700":
                                          a.status==="refusée"  ?"bg-red-900/40   text-red-300   border-red-700":
                                                                "bg-neutral-800  text-neutral-300 border-neutral-700";
                        const label = a.status==="en_attente"?"En attente":a.status==="approuvée"?"Approuvée":"Refusée";
                        const deciderName = a.decidedBy ? users.find(x=>x.id===a.decidedBy)?.name : undefined;
                        return (
                          <tr key={a.id} className="border-t border-neutral-800 bg-[#0b0f15]">
                            <td className="p-3 font-medium">{u?.name}</td>
                            <td className="p-3">{a.type}</td>
                            <td className="p-3">{a.from} → {a.to}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <span className={`text-[12px] px-2 py-0.5 rounded-full border ${statusCls}`}>{label}</span>
                                {deciderName && <span className="text-[11px] text-neutral-400">par {deciderName}</span>}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </Panel>

            {/* Contact Direction */}
            <Panel title="CONTACT DIRECTION">
              <div className="xl:flex xl:gap-4 h-full">
                {/* Liste interlocuteurs */}
                <nav className="xl:w-72">
                  <Scroller>
                    {partners.map(p=>{
                      const sel=p.id===peerId;
                      return (
                        <button key={p.id}
                          className={`w-full text-left p-4 rounded-xl border transition mb-3 ${sel?"bg-[#141923] border-neutral-600":"bg-[#0b0f15] border-neutral-800 hover:border-neutral-600"}`}
                          onClick={()=>setPeerId(p.id)}
                        >
                          <div className="flex items-center gap-3">
                            <span className="h-9 w-9 rounded-full bg-[#141923] border border-neutral-700 flex items-center justify-center text-sm">
                              {p.name.slice(0,2).toUpperCase()}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold truncate">{p.name}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-900/40 text-green-300 border border-green-700">en ligne</span>
                              </div>
                              <span className="text-xs text-neutral-400 capitalize">{p.role}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                    {!partners.length && <div className="text-sm text-neutral-400">Aucun interlocuteur.</div>}
                  </Scroller>
                </nav>

                {/* Fil + input fixé bas */}
                <div className="mt-4 xl:mt-0 xl:flex-1 xl:flex xl:flex-col">
                  <div className="flex-1 overflow-auto pr-1 space-y-3">
                    {thread.map(m=>{
                      const mine=m.fromUserId===me?.id; const u=users.find(x=>x.id===m.fromUserId);
                      return (
                        <div key={m.id} className={`flex ${mine?"justify-end":"justify-start"}`}>
                          <div className={`max-w-[80%] px-4 py-3 rounded-2xl border text-[15px] leading-relaxed
                            ${mine?"bg-[#c7a27a] text-black border-[#c7a27a]":"bg-[#11151d] text-neutral-200 border-neutral-700"}`}>
                            {!mine && <div className="text-[12px] font-medium mb-0.5 text-neutral-300">{u?.name}</div>}
                            <div className="whitespace-pre-wrap break-words">{m.text}</div>
                            <div className="text-[11px] mt-1 text-neutral-400">{new Date(m.createdAt).toLocaleTimeString()}</div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={endRef}/>
                    {!thread.length && <div className="text-sm text-neutral-500">Aucun message. Sélectionnez un contact.</div>}
                  </div>

                  <form className="mt-3 flex items-center gap-3" onSubmit={(e)=>{e.preventDefault();send();}}>
                    <input className="flex-1 px-4 py-3 rounded-lg border border-neutral-700 bg-[#0b0f15]"
                      placeholder={peerId?"Votre message…":"Sélectionnez un interlocuteur"}
                      disabled={!peerId} value={draft} onChange={e=>setDraft(e.target.value)}/>
                    <button type="submit" className="px-5 py-3 rounded-lg bg-[#c7a27a] text-black font-semibold disabled:opacity-50"
                      disabled={!peerId || !draft.trim()}>Envoyer</button>
                  </form>
                </div>
              </div>
            </Panel>
          </div>
        </main>
      )}
    </div>
  );
}

/* ========= UI bits ========= */
function TopBar({me,role,logout}:{me:UserT|null; role:Role|null; logout:()=>void}) {
  return (
    <header className="border-b border-neutral-800" style={{background:"#0d1118"}}>
      <div className="mx-auto max-w-[1440px] h-16 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/custom-caffe-logo.png" alt="Custom Caffe" width={36} height={36} className="rounded-full"/>
          <span className="text-lg font-semibold">Portal RH - Custom Caffe</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] px-2 py-0.5 rounded-full bg-[#0b0f15] border border-neutral-700 capitalize">{role??"non connecté"}</span>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-[#141923] border border-neutral-700 flex items-center justify-center text-xs">
              {(me?.name ?? "Invité").slice(0,2).toUpperCase()}
            </div>
            <span className="text-sm">{me?.name ?? "Invité"}</span>
          </div>
          {role && <button onClick={logout} className="p-2 rounded hover:bg-[#141923]" title="Se déconnecter">⎋</button>}
        </div>
      </div>
    </header>
  );
}

/** Grande carte avec hauteur fixe & contenu scroll interne */
function Panel({title,children}:{title:string;children:React.ReactNode}) {
  return (
    <section className="rounded-3xl border border-neutral-800 bg-[#0d1118] shadow-[0_10px_30px_rgba(0,0,0,.45)] overflow-hidden flex flex-col h-[720px]">
      <header className="px-6 py-5">
        <h2 className="text-2xl font-extrabold tracking-wide">{title}</h2>
      </header>
      <div className="px-5 pb-6 pt-1 border-t border-neutral-800 bg-[#0f1319] flex-1 flex flex-col">
        {children}
      </div>
    </section>
  );
}
function Scroller({children}:{children:React.ReactNode}) {
  return <div className="mt-4 flex-1 overflow-auto pr-2 space-y-4 min-h-0">{children}</div>;
}


