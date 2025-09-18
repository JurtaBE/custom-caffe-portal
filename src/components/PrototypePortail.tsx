'use client';
import { useMemo, useState, useEffect, useRef } from "react";

/**
 * Prototype RH — thème sombre pro
 * - Grille stable 3 colonnes
 * - Boutons Approuver/Refuser toujours cliquables (z-20)
 * - “Valider au nom de” : sélecteur de décideur (manager/admin)
 * - Chat 1:1 aligné, auto-scroll
 */

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

const seedUsers:UserT[] = [
  {id:"u1", email:"employee@test.com", name:"Alice Martin",  role:"employee", active:true},
  {id:"u2", email:"manager@test.com",  name:"Bruno Lefevre", role:"manager",  active:true},
  {id:"u3", email:"admin@test.com",    name:"Chloé Dubois",  role:"admin",    active:true},
  {id:"u4", email:"paul@exemple.com",  name:"Paul Noël",     role:"employee", active:true},
];

export default function PrototypePortail() {
  /* ======= Auth (mock) ======= */
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState(""); // ignoré
  const [currentUser,setCurrentUser] = useState<UserT|null>(null);
  const me = currentUser;

  const usersInit = useMemo(()=>seedUsers,[]);
  const [users,setUsers] = useState<UserT[]>(usersInit);

  const handleLogin = () => {
    const found = users.find(u=>u.email.toLowerCase()===email.toLowerCase());
    if(!found){ alert("Utilisateur inconnu. Utilisez les comptes de test."); return; }
    setCurrentUser(found);
  };
  const handleLogout = ()=>setCurrentUser(null);

  const role = me?.role ?? null;
  const isAdmin   = role==="admin";
  const isManager = role==="manager";
  const isEmployee= role==="employee";

  /* ======= Annonces ======= */
  const [annonces, setAnnonces] = useState<AnnouncementT[]>([
    {id:rid(), title:"Nouvelle charte sécurité", content:"Casques obligatoires en zone A.", createdBy:"u3", createdAt:nowISO()},
    {id:rid(), title:"Prime de performance", content:"Versement prévu fin du mois.", createdBy:"u2", createdAt:nowISO()},
  ]);
  const [newAnn,setNewAnn]=useState({title:"",content:""});
  const publishAnn=()=>{ if(!me) return; if(!newAnn.title.trim()||!newAnn.content.trim()) return;
    setAnnonces(p=>[{id:rid(),title:newAnn.title,content:newAnn.content,createdBy:me.id,createdAt:nowISO()},...p]);
    setNewAnn({title:"",content:""});
  };

  /* ======= Absences ======= */
  const [absences,setAbsences]=useState<AbsenceT[]>([
    {id:rid(), userId:"u1", type:"Maladie", from:"2025-09-18", to:"2025-09-25", reason:"", status:"en_attente"},
    {id:rid(), userId:"u1", type:"CP",      from:"2025-09-22", to:"2025-09-24", reason:"Vacances", status:"en_attente"},
    {id:rid(), userId:"u4", type:"RTT",     from:"2025-09-19", to:"2025-09-19", reason:"RDV médical", status:"en_attente"},
  ]);
  const [newAbs,setNewAbs]=useState({type:"CP",from:"",to:"",reason:""});

  const submitAbs=()=>{ if(!me) return; if(!newAbs.from||!newAbs.to) return;
    setAbsences(p=>[{id:rid(), userId:me.id, type:newAbs.type, from:newAbs.from, to:newAbs.to, reason:newAbs.reason, status:"en_attente"}, ...p]);
    setNewAbs({type:"CP",from:"",to:"",reason:""});
  };

  /* ► Valider “au nom de” */
  const direction = useMemo(()=>users.filter(u=>u.role==="manager"||u.role==="admin"),[users]);
  const [deciderId,setDeciderId] = useState<string|undefined>(direction[0]?.id);
  useEffect(()=>{ if(!deciderId && direction[0]) setDeciderId(direction[0].id); },[direction,deciderId]);
  const decideAbs=(id:string, decision:"approuvée"|"refusée")=>{
    if(!(isAdmin||isManager)) return;
    const decider = users.find(u=>u.id===deciderId) ?? me ?? undefined;
    setAbsences(p=>p.map(a=>a.id===id?{...a,status:decision,decidedBy:decider?.id,decidedAt:nowISO()}:a));
  };

  /* ======= DM (chat privé) ======= */
  const [dm,setDm]=useState<DM[]>([
    {id:rid(), fromUserId:"u1", toUserId:"u2", text:"Peut-on avoir des gants taille S ?", createdAt:nowISO()},
    {id:rid(), fromUserId:"u2", toUserId:"u1", text:"Brief sécurité demain 8h.",           createdAt:nowISO()},
  ]);
  const partners = useMemo(()=>{
    if(isEmployee) return direction;
    if(isManager||isAdmin) return users.filter(u=>u.role==="employee");
    return [];
  },[isEmployee,isManager,isAdmin,users,direction]);
  const [peerId,setPeerId] = useState<string|undefined>(partners[0]?.id);
  useEffect(()=>{ if(!peerId && partners[0]) setPeerId(partners[0].id); },[partners,peerId]);

  const thread = useMemo(()=>!me||!peerId?[]:
    dm.filter(m=>(m.fromUserId===me.id&&m.toUserId===peerId)||(m.fromUserId===peerId&&m.toUserId===me.id))
      .sort((a,b)=>+new Date(a.createdAt)-+new Date(b.createdAt))
  ,[dm,me,peerId]);

  const [draft,setDraft] = useState("");
  const sendDM=()=>{ if(!me||!peerId||!draft.trim()) return;
    setDm(p=>[...p,{id:rid(),fromUserId:me.id,toUserId:peerId,text:draft.trim(),createdAt:nowISO()}]); setDraft("");
  };
  const endRef = useRef<HTMLDivElement|null>(null);
  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:"smooth"}); },[thread.length]);

  /* ======= Dérivés ======= */
  const team=useMemo(()=>users.filter(u=>u.role!=="admin"),[users]);
  const pending=useMemo(()=>absences.filter(a=>a.status==="en_attente"),[absences]);

  /* ======= UI ======= */
  return (
    <div className="min-h-screen text-neutral-100" style={{background:"#0f1115"}}>
      <TopBar me={me} role={role} onLogout={handleLogout} />

      <main className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-8">
        {!me ? (
          <Auth email={email} setEmail={setEmail} password={password} setPassword={setPassword} onLogin={handleLogin}/>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Annonces */}
            <Card title="Annonces">
              {(isAdmin||isManager) && (
                <div className="space-y-2 p-3 rounded-xl border border-neutral-700 bg-[#12151b]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input className="px-3 py-2 rounded border border-neutral-700 bg-[#0f1319]" placeholder="Titre"
                           value={newAnn.title} onChange={e=>setNewAnn({...newAnn,title:e.target.value})}/>
                    <button onClick={publishAnn} className="justify-self-end px-4 py-2 rounded bg-[#c7a27a] text-black font-medium hover:brightness-110">Publier</button>
                    <div className="md:col-span-2">
                      <textarea className="w-full px-3 py-2 rounded border border-neutral-700 bg-[#0f1319]" placeholder="Contenu"
                                value={newAnn.content} onChange={e=>setNewAnn({...newAnn,content:e.target.value})}/>
                    </div>
                  </div>
                </div>
              )}
              <div className="max-h-[420px] overflow-auto pr-2 space-y-3">
                {annonces.map(a=>(
                  <article key={a.id} className="p-3 rounded-xl border border-neutral-700 bg-[#12151b]">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{a.title}</h3>
                      <time className="text-[11px] px-2 py-0.5 rounded-full bg-[#1b1f27] text-neutral-300 border border-neutral-700">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </time>
                    </div>
                    <p className="text-sm text-neutral-300 mt-1">{a.content}</p>
                  </article>
                ))}
              </div>
            </Card>

            {/* Absences */}
            <Card title="Absences">
              {isEmployee && (
                <div className="p-3 rounded-xl border border-neutral-700 bg-[#12151b] space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <select className="px-3 py-2 rounded border border-neutral-700 bg-[#0f1319]" value={newAbs.type} onChange={e=>setNewAbs({...newAbs,type:e.target.value})}>
                      <option>CP</option><option>RTT</option><option>Maladie</option>
                    </select>
                    <input type="date" className="px-3 py-2 rounded border border-neutral-700 bg-[#0f1319]" value={newAbs.from} onChange={e=>setNewAbs({...newAbs,from:e.target.value})}/>
                    <input type="date" className="px-3 py-2 rounded border border-neutral-700 bg-[#0f1319]" value={newAbs.to} onChange={e=>setNewAbs({...newAbs,to:e.target.value})}/>
                    <button onClick={submitAbs} className="justify-self-end px-4 py-2 rounded bg-[#c7a27a] text-black font-medium hover:brightness-110">Demander</button>
                  </div>
                  <textarea className="w-full px-3 py-2 rounded border border-neutral-700 bg-[#0f1319]" placeholder="Motif (optionnel)"
                            value={newAbs.reason} onChange={e=>setNewAbs({...newAbs,reason:e.target.value})}/>
                </div>
              )}

              {(isManager||isAdmin) && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold">Demandes en attente</h4>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#1b1f27] border border-neutral-700">{pending.length}</span>
                    {/* ▼ Valider au nom de */}
                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-xs text-neutral-300">Valider au nom de :</span>
                      <select className="px-2 py-1 rounded border border-neutral-700 bg-[#0f1319] text-sm"
                              value={deciderId} onChange={e=>setDeciderId(e.target.value)}>
                        {direction.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="rounded-xl border border-neutral-700 overflow-hidden relative z-10">
                    <table className="w-full text-sm">
                      <thead className="bg-[#151922] text-neutral-200">
                        <tr className="text-left">
                          <th className="p-2">Employé</th><th className="p-2">Type</th><th className="p-2">Du</th><th className="p-2">Au</th><th className="p-2">Motif</th><th className="p-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pending.map(a=>{
                          const u=users.find(x=>x.id===a.userId);
                          return (
                            <tr key={a.id} className="border-t border-neutral-800 bg-[#0f1319]">
                              <td className="p-2 font-medium">{u?.name}</td>
                              <td className="p-2">{a.type}</td>
                              <td className="p-2">{a.from}</td>
                              <td className="p-2">{a.to}</td>
                              <td className="p-2 max-w-[180px] truncate" title={a.reason}>{a.reason||"—"}</td>
                              <td className="p-2 text-right space-x-2">
                                <button onClick={()=>decideAbs(a.id,"refusée")}  className="px-3 py-1 rounded border border-neutral-600 hover:bg-[#151922] relative z-20">Refuser</button>
                                <button onClick={()=>decideAbs(a.id,"approuvée")} className="px-3 py-1 rounded bg-[#c7a27a] text-black font-medium hover:brightness-110 relative z-20">Approuver</button>
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
                <h4 className="font-semibold">Suivi</h4>
                <div className="rounded-xl border border-neutral-700 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-[#151922] text-neutral-200">
                      <tr className="text-left">
                        <th className="p-2">Employé</th><th className="p-2">Type</th><th className="p-2">Période</th><th className="p-2">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {absences.map(a=>{
                        const u=users.find(x=>x.id===a.userId);
                        const cls = a.status==="approuvée"?"bg-green-900/40 text-green-300 border-green-700":
                                    a.status==="refusée"  ?"bg-red-900/40   text-red-300   border-red-700":
                                                          "bg-neutral-800  text-neutral-300 border-neutral-700";
                        const lab = a.status==="en_attente"?"En attente":a.status==="approuvée"?"Approuvée":"Refusée";
                        return (
                          <tr key={a.id} className="border-t border-neutral-800 bg-[#0f1319]">
                            <td className="p-2 font-medium">{u?.name}</td>
                            <td className="p-2">{a.type}</td>
                            <td className="p-2">{a.from} → {a.to}</td>
                            <td className="p-2"><span className={`text-[11px] px-2 py-0.5 rounded-full border ${cls}`}>{lab}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>

            {/* Contact Direction (DM) */}
            <Card title="Contact Direction">
              <div className="md:flex md:gap-3">
                {/* Interlocuteurs */}
                <nav className="md:w-60">
                  <ul className="space-y-2 max-h-[390px] overflow-auto pr-1">
                    {partners.map(p=>{
                      const sel = p.id===peerId;
                      return (
                        <li key={p.id}>
                          <button
                            className={`w-full text-left px-3 py-2 rounded border transition
                                       ${sel?"bg-[#151922] border-neutral-600":"bg-[#0f1319] border-neutral-800 hover:border-neutral-600"}`}
                            onClick={()=>setPeerId(p.id)}
                          >
                            <div className="flex items-center gap-2">
                              <span className="h-7 w-7 rounded-full bg-[#1b1f27] border border-neutral-700 flex items-center justify-center text-xs">
                                {p.name.slice(0,2).toUpperCase()}
                              </span>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium truncate">{p.name}</span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-900/40 text-green-300 border border-green-700">en ligne</span>
                                </div>
                                <span className="text-xs text-neutral-400 capitalize">{p.role}</span>
                              </div>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                    {!partners.length && <li className="text-sm text-neutral-400 px-2">Aucun interlocuteur.</li>}
                  </ul>
                </nav>

                {/* Fil + saisie */}
                <div className="mt-3 md:mt-0 md:flex-1 md:flex md:flex-col">
                  <div className="flex-1 overflow-auto pr-1 space-y-2">
                    {thread.map(m=>{
                      const mine = m.fromUserId===me?.id;
                      const u = users.find(x=>x.id===m.fromUserId);
                      return (
                        <div key={m.id} className={`flex ${mine?"justify-end":"justify-start"}`}>
                          <div className={`max-w-[78%] px-3 py-2 rounded-2xl border text-sm leading-relaxed
                                          ${mine? "bg-[#c7a27a] text-black border-[#c7a27a]" : "bg-[#12151b] text-neutral-200 border-neutral-700"}`}>
                            {!mine && <div className="text-[11px] font-medium mb-0.5 text-neutral-300">{u?.name}</div>}
                            <div className="whitespace-pre-wrap break-words">{m.text}</div>
                            <div className="text-[10px] mt-1 text-neutral-400">{new Date(m.createdAt).toLocaleTimeString()}</div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={endRef}/>
                    {!thread.length && <div className="text-xs text-neutral-500">Aucun message. Sélectionnez un contact.</div>}
                  </div>

                  <form className="mt-2 flex items-center gap-2" onSubmit={(e)=>{e.preventDefault();sendDM();}}>
                    <input className="flex-1 px-3 py-2 rounded border border-neutral-700 bg-[#0f1319]"
                           placeholder={peerId?"Votre message…":"Sélectionnez un interlocuteur"}
                           disabled={!peerId}
                           value={draft} onChange={e=>setDraft(e.target.value)}/>
                    <button type="submit" className="px-4 py-2 rounded bg-[#c7a27a] text-black font-medium disabled:opacity-50"
                            disabled={!peerId || !draft.trim()}>Envoyer</button>
                  </form>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>

      <footer className="text-center text-xs text-neutral-400 py-6">
        Prototype UI (mock). Auth, DB, RBAC, Realtime & RGPD à venir.
      </footer>
    </div>
  );
}

/* ======= UI bits ======= */
function Card({title,children}:{title:string;children:React.ReactNode}) {
  return (
    <section className="rounded-3xl border border-neutral-800 bg-[#0d1016] shadow-[0_10px_30px_rgba(0,0,0,.45)] overflow-hidden flex flex-col min-h-[520px]">
      <header className="px-6 pt-6 pb-3 bg-[#0d1016]">
        <h2 className="text-2xl font-extrabold tracking-wide">{title.toUpperCase()}</h2>
      </header>
      <div className="px-5 pb-6 pt-2 bg-[#0f1319] border-t border-neutral-800 flex-1">
        {children}
      </div>
    </section>
  );
}

function TopBar({me,role,onLogout}:{me:UserT|null; role:Role|null; onLogout:()=>void}) {
  return (
    <header className="border-b border-neutral-800 sticky top-0 z-30" style={{background:"#0d1016"}}>
      <div className="mx-auto max-w-7xl h-16 px-4 md:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/custom-caffe-logo.png" alt="Custom Caffe" width={36} height={36} className="rounded-full"/>
          <span className="text-lg font-semibold">Portal RH - Custom Caffe</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#1b1f27] border border-neutral-700 capitalize">
            {role ?? "non connecté"}
          </span>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-[#1b1f27] border border-neutral-700 flex items-center justify-center text-xs">
              {(me?.name ?? "Invité").slice(0,2).toUpperCase()}
            </div>
            <span className="text-sm">{me?.name ?? "Invité"}</span>
          </div>
          {role && <button onClick={onLogout} className="p-2 rounded hover:bg-[#151922]" title="Se déconnecter">⎋</button>}
        </div>
      </div>
    </header>
  );
}

function Auth({email,setEmail,password,setPassword,onLogin}:{email:string;setEmail:any;password:string;setPassword:any;onLogin:()=>void}) {
  return (
    <div className="mx-auto max-w-3xl grid grid-cols-1 lg:grid-cols-2 gap-6">
      <section className="rounded-3xl border border-neutral-800 bg-[#0d1016] shadow-[0_10px_30px_rgba(0,0,0,.45)] overflow-hidden">
        <header className="px-6 pt-6 pb-3"><h2 className="text-2xl font-extrabold">Connexion</h2></header>
        <div className="px-5 pb-6 pt-2 bg-[#0f1319] border-t border-neutral-800 space-y-3">
          <div className="space-y-1">
            <label className="text-sm text-neutral-300">Email</label>
            <input className="w-full px-3 py-2 rounded border border-neutral-700 bg-[#0f1319]" value={email} onChange={e=>setEmail(e.target.value)} placeholder="employee@test.com"/>
          </div>
          <div className="space-y-1">
            <label className="text-sm text-neutral-300">Mot de passe <span className="text-xs text-neutral-500">(mock)</span></label>
            <input type="password" className="w-full px-3 py-2 rounded border border-neutral-700 bg-[#0f1319]" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"/>
          </div>
          <button className="w-full px-4 py-2 rounded bg-[#c7a27a] text-black font-semibold" onClick={onLogin}>Entrer</button>
          <p className="text-xs text-neutral-400">Utilise : employee@test.com · manager@test.com · admin@test.com</p>
        </div>
      </section>

      <section className="rounded-3xl border border-neutral-800 bg-[#0d1016] shadow-[0_10px_30px_rgba(0,0,0,.45)] overflow-hidden">
        <header className="px-6 pt-6 pb-3"><h2 className="text-2xl font-extrabold">Comptes de test</h2></header>
        <div className="px-5 pb-6 pt-2 bg-[#0f1319] border-t border-neutral-800 text-sm space-y-2">
          <div className="flex items-center justify-between"><span>Employé</span><code className="px-2 py-0.5 rounded bg-[#1b1f27] border border-neutral-700">employee@test.com</code></div>
          <div className="flex items-center justify-between"><span>Manager</span><code className="px-2 py-0.5 rounded bg-[#1b1f27] border border-neutral-700">manager@test.com</code></div>
          <div className="flex items-center justify-between"><span>Admin</span><code className="px-2 py-0.5 rounded bg-[#1b1f27] border border-neutral-700">admin@test.com</code></div>
          <p className="text-xs text-neutral-500">Le mot de passe est ignoré (mock).</p>
        </div>
      </section>
    </div>
  );
}
