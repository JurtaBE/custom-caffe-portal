'use client';
import { useMemo, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

/* =========================
   Types & helpers
========================= */
type Role = "employee" | "manager" | "admin";

interface UserT { id:string; email:string; name:string; role:Role; active?:boolean }
interface AnnouncementT { id:string; title:string; content:string; createdBy:string; createdAt:string }
interface AbsenceT {
  id:string; userId:string; type:string; from:string; to:string; reason:string;
  status:"en_attente"|"approuvée"|"refusée"; decidedBy?:string; decidedAt?:string
}
interface DirectMessageT { id:string; fromUserId:string; toUserId:string; text:string; createdAt:string; readAt?:string }

const nowISO = () => new Date().toISOString();
const rid = () => Math.random().toString(36).slice(2,10);

/* =========================
   Données de départ (mock)
========================= */
const seedUsers:UserT[] = [
  {id:"u1", email:"employee@test.com", name:"Alice Martin",  role:"employee", active:true},
  {id:"u2", email:"manager@test.com",  name:"Bruno Lefevre", role:"manager",  active:true},
  {id:"u3", email:"admin@test.com",    name:"Chloé Dubois",  role:"admin",    active:true},
  {id:"u4", email:"paul@exemple.com",  name:"Paul Noël",     role:"employee", active:true},
];

/* =========================
   Composant principal
========================= */
export default function PrototypePortail() {
  /* Auth mock */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // ignoré
  const [currentUser, setCurrentUser] = useState<UserT|null>(null);

  /* Stores mock */
  const [users, setUsers] = useState<UserT[]>(seedUsers);

  const [annonces, setAnnonces] = useState<AnnouncementT[]>([
    {id:rid(), title:"Nouvelle charte sécurité", content:"Casques obligatoires en zone A.", createdBy:"u3", createdAt:nowISO()},
    {id:rid(), title:"Prime de performance", content:"Versement prévu fin du mois.", createdBy:"u2", createdAt:nowISO()},
  ]);

  const [absences, setAbsences] = useState<AbsenceT[]>([
    {id:rid(), userId:"u1", type:"Maladie", from:"2025-09-18", to:"2025-09-25", reason:"", status:"en_attente"},
    {id:rid(), userId:"u1", type:"CP",      from:"2025-09-22", to:"2025-09-24", reason:"Vacances", status:"en_attente"},
    {id:rid(), userId:"u4", type:"RTT",     from:"2025-09-19", to:"2025-09-19", reason:"RDV médical", status:"en_attente"},
  ]);

  /* Chat direct */
  const [dm, setDm] = useState<DirectMessageT[]>([
    {id:rid(), fromUserId:"u1", toUserId:"u2", text:"Peut-on avoir des gants taille S ?", createdAt:nowISO()},
    {id:rid(), fromUserId:"u2", toUserId:"u1", text:"Brief sécurité demain 8h.", createdAt:nowISO()},
  ]);

  /* Rôles */
  const currentRole:Role|null = currentUser?.role ?? null;
  const isAdmin = currentRole==="admin";
  const isManager = currentRole==="manager";
  const isEmployee = currentRole==="employee";
  const meName = currentUser?.name ?? "Invité";

  const handleLogin = () => {
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) { alert("Utilisateur inconnu. Utilisez les comptes de test indiqués."); return; }
    setCurrentUser(found);
  };
  const handleLogout = () => setCurrentUser(null);

  /* Annonces */
  const [newAnn, setNewAnn] = useState({ title:"", content:"" });
  const publishAnn = () => {
    if (!currentUser) return;
    if (!newAnn.title.trim() || !newAnn.content.trim()) return;
    setAnnonces(p => [{ id:rid(), title:newAnn.title, content:newAnn.content, createdBy:currentUser.id, createdAt:nowISO()}, ...p]);
    setNewAnn({ title:"", content:"" });
  };

  /* Absences */
  const [newAbs, setNewAbs] = useState({ type:"CP", from:"", to:"", reason:"" });
  const submitAbs = () => {
    if (!currentUser) return;
    if (!newAbs.from || !newAbs.to) return;
    setAbsences(p => [{ id:rid(), userId:currentUser.id, type:newAbs.type, from:newAbs.from, to:newAbs.to, reason:newAbs.reason, status:"en_attente" }, ...p]);
    setNewAbs({ type:"CP", from:"", to:"", reason:"" });
  };
  /** ✅ Fix validation : boutons au-dessus de tout + pas d’overlay qui bloque les clics */
  const decideAbs = (id:string, decision:"approuvée"|"refusée") => {
    if (!currentUser) return;
    setAbsences(p => p.map(a => a.id===id ? { ...a, status:decision, decidedBy:currentUser.id, decidedAt:nowISO() } : a));
  };

  /* Gestion employés */
  const [empDraft, setEmpDraft] = useState({ name:"", email:"", role:"employee" as Role, active:true });
  const addEmployee = () => {
    if (!empDraft.name || !empDraft.email) return;
    setUsers(p => [...p, { id:rid(), name:empDraft.name, email:empDraft.email, role:empDraft.role, active:empDraft.active }]);
    setEmpDraft({ name:"", email:"", role:"employee", active:true });
  };
  const toggleActive = (uid:string) => setUsers(p => p.map(u => u.id===uid ? { ...u, active:!u.active } : u));

  /* Sélecteurs DM */
  const directionList = useMemo(() => users.filter(u => u.role==="manager"||u.role==="admin"), [users]);
  const employeesList = useMemo(() => users.filter(u => u.role==="employee"), [users]);
  const partners = useMemo(() => isEmployee ? directionList : (isManager||isAdmin ? employeesList : []), [isEmployee,isManager,isAdmin,directionList,employeesList]);

  const [selectedPartnerId, setSelectedPartnerId] = useState<string|null>(null);
  useEffect(() => { if (!selectedPartnerId && partners.length) setSelectedPartnerId(partners[0].id); }, [partners, selectedPartnerId]);

  const currentThread = useMemo(() => {
    if (!currentUser || !selectedPartnerId) return [];
    return dm
      .filter(m =>
        (m.fromUserId===currentUser.id && m.toUserId===selectedPartnerId) ||
        (m.fromUserId===selectedPartnerId && m.toUserId===currentUser.id)
      )
      .sort((a,b)=> new Date(a.createdAt).getTime()-new Date(b.createdAt).getTime());
  }, [dm, currentUser, selectedPartnerId]);

  const [draftDm, setDraftDm] = useState("");
  const sendDirect = () => {
    if (!currentUser || !selectedPartnerId || !draftDm.trim()) return;
    setDm(p => [...p, { id:rid(), fromUserId:currentUser.id, toUserId:selectedPartnerId, text:draftDm.trim(), createdAt:nowISO() }]);
    setDraftDm("");
  };
  const threadEndRef = useRef<HTMLDivElement|null>(null);
  useEffect(() => { threadEndRef.current?.scrollIntoView({ behavior:"smooth", block:"end" }); }, [dm, selectedPartnerId]);

  /* Dérivés */
  const team = useMemo(()=>users.filter(u=>u.role!=="admin"),[users]);
  const pendingAbs = useMemo(()=>absences.filter(a=>a.status==="en_attente"),[absences]);

  /* =========================
     THEME & LAYOUT GLOBAL
     (style proche de ta maquette)
  ========================= */
  return (
    <div className="min-h-screen" style={{ background:"#1f140f" }}>
      <TopBar meName={meName} role={currentRole} onLogout={handleLogout} />

      <main className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-8">
        {!currentUser ? (
          <AuthCard email={email} setEmail={setEmail} password={password} setPassword={setPassword} onLogin={handleLogin} />
        ) : (
          <motion.div
            initial={{ opacity:0, y:6 }}
            animate={{ opacity:1, y:0 }}
            className="grid gap-8 lg:grid-cols-3"
          >
            {/* ========== COL 1 : ANNONCES ========== */}
            <SectionCard title="Annonces">
              {(isAdmin || isManager) && (
                <div className="space-y-2 p-3 border rounded-xl bg-[#f5eee3]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input className="px-3 py-2 rounded border" placeholder="Titre"
                      value={newAnn.title} onChange={e=>setNewAnn(s=>({...s,title:e.target.value}))} />
                    <button onClick={publishAnn} className="justify-self-end px-4 py-2 rounded bg-[#6f4e37] text-white">Publier</button>
                    <div className="md:col-span-2">
                      <textarea className="w-full px-3 py-2 rounded border" placeholder="Contenu"
                        value={newAnn.content} onChange={e=>setNewAnn(s=>({...s,content:e.target.value}))} />
                    </div>
                  </div>
                </div>
              )}

              <div className="max-h-[430px] overflow-auto pr-2 space-y-3">
                {annonces.map(a=>(
                  <article key={a.id} className="p-3 rounded-xl border bg-white">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{a.title}</h3>
                      <time className="text-xs px-2 py-0.5 rounded-full bg-[#f0e4d7] text-[#6f4e37]">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </time>
                    </div>
                    <p className="text-sm text-neutral-700 mt-1">{a.content}</p>
                  </article>
                ))}
              </div>
            </SectionCard>

            {/* ========== COL 2 : ABSENCES ========== */}
            <SectionCard title="Absences">
              {isEmployee && (
                <div className="p-3 border rounded-xl bg-[#f5eee3] space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <select className="px-3 py-2 rounded border" value={newAbs.type} onChange={e=>setNewAbs(s=>({...s,type:e.target.value}))}>
                      <option>CP</option><option>RTT</option><option>Maladie</option>
                    </select>
                    <input type="date" className="px-3 py-2 rounded border" value={newAbs.from} onChange={e=>setNewAbs(s=>({...s,from:e.target.value}))}/>
                    <input type="date" className="px-3 py-2 rounded border" value={newAbs.to} onChange={e=>setNewAbs(s=>({...s,to:e.target.value}))}/>
                    <button onClick={submitAbs} className="justify-self-end px-4 py-2 rounded bg-[#6f4e37] text-white">Demander</button>
                  </div>
                  <textarea className="w-full px-3 py-2 rounded border" placeholder="Motif (optionnel)"
                    value={newAbs.reason} onChange={e=>setNewAbs(s=>({...s,reason:e.target.value}))}/>
                </div>
              )}

              {(isManager || isAdmin) && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Demandes en attente</h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#f0e4d7] text-[#6f4e37]">{pendingAbs.length}</span>
                  </div>

                  {/* 🛠 table cliquable sans overlay, z-index élevé */}
                  <div className="rounded-xl border overflow-hidden relative z-10">
                    <table className="w-full text-sm">
                      <thead className="bg-[#ead8c0]">
                        <tr className="text-left">
                          <th className="p-2">Employé</th><th className="p-2">Type</th><th className="p-2">Du</th>
                          <th className="p-2">Au</th><th className="p-2">Motif</th><th className="p-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingAbs.map(a=>{
                          const u = users.find(x=>x.id===a.userId);
                          return (
                            <tr key={a.id} className="border-t">
                              <td className="p-2 font-medium">{u?.name}</td>
                              <td className="p-2">{a.type}</td>
                              <td className="p-2">{a.from}</td>
                              <td className="p-2">{a.to}</td>
                              <td className="p-2 max-w-[160px] truncate" title={a.reason}>{a.reason || "—"}</td>
                              <td className="p-2 text-right space-x-2">
                                <button
                                  onClick={()=>decideAbs(a.id,"refusée")}
                                  className="px-3 py-1 rounded border hover:bg-neutral-50"
                                  style={{position:"relative", zIndex:20}}
                                >Refuser</button>
                                <button
                                  onClick={()=>decideAbs(a.id,"approuvée")}
                                  className="px-3 py-1 rounded bg-[#6f4e37] text-white hover:brightness-105"
                                  style={{position:"relative", zIndex:20}}
                                >Approuver</button>
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
                <div className="rounded-xl border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-[#ead8c0]">
                      <tr className="text-left">
                        <th className="p-2">Employé</th><th className="p-2">Type</th><th className="p-2">Période</th><th className="p-2">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {absences.map(a=>{
                        const u=users.find(x=>x.id===a.userId);
                        const s=a.status==="approuvée"?"bg-green-100 text-green-700":a.status==="refusée"?"bg-red-100 text-red-700":"bg-gray-100 text-gray-700";
                        const lab=a.status==="en_attente"?"En attente":a.status==="approuvée"?"Approuvée":"Refusée";
                        return (
                          <tr key={a.id} className="border-t">
                            <td className="p-2 font-medium">{u?.name}</td>
                            <td className="p-2">{a.type}</td>
                            <td className="p-2">{a.from} → {a.to}</td>
                            <td className="p-2"><span className={`text-xs px-2 py-0.5 rounded-full ${s}`}>{lab}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </SectionCard>

            {/* ========== COL 3 : CONTACT DIRECTION (DM) ========== */}
            <SectionCard title="CONTACT DIRECTION">
              <div className="md:flex md:gap-3">
                {/* Liste interlocuteurs */}
                <nav aria-label="Interlocuteurs" className="md:w-60">
                  <ul className="space-y-2 max-h-[390px] overflow-auto pr-1">
                    {partners.map(p=>{
                      const isSel = selectedPartnerId===p.id;
                      return (
                        <li key={p.id}>
                          <button
                            className={`w-full text-left px-3 py-2 rounded border transition
                              ${isSel? "bg-[#f7efe4] border-[#d3bfa6]" : "bg-white hover:bg-neutral-50 border-neutral-200"}`}
                            onClick={()=>setSelectedPartnerId(p.id)}
                            aria-current={isSel ? "page" : undefined}
                          >
                            <div className="flex items-center gap-2">
                              <span className="h-7 w-7 rounded-full bg-[#f0e4d7] flex items-center justify-center text-xs text-[#6f4e37]">
                                {p.name.slice(0,2).toUpperCase()}
                              </span>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium truncate">{p.name}</span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 shrink-0">en ligne</span>
                                </div>
                                <span className="text-xs text-neutral-500 capitalize">{p.role}</span>
                              </div>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                    {!partners.length && <li className="text-sm text-neutral-400 px-2">Aucun interlocuteur.</li>}
                  </ul>
                </nav>

                {/* Fil */}
                <div className="mt-3 md:mt-0 md:flex-1 md:flex md:flex-col">
                  <div className="flex-1 overflow-auto pr-1 space-y-2">
                    {currentThread.map(m=>{
                      const mine = m.fromUserId===currentUser?.id;
                      const user = users.find(u=>u.id===m.fromUserId);
                      return (
                        <div key={m.id} className={`flex ${mine?"justify-end":"justify-start"}`}>
                          <div className={`max-w-[78%] px-3 py-2 rounded-2xl border text-sm leading-relaxed
                            ${mine? "bg-[#6f4e37] text-white border-[#6f4e37] rounded-br-sm"
                                  : "bg-white text-neutral-800 border-neutral-200 rounded-bl-sm"}`}>
                            {!mine && <div className="text-[11px] font-medium mb-0.5">{user?.name}</div>}
                            <div className="whitespace-pre-wrap break-words">{m.text}</div>
                            <div className={`text-[10px] mt-1 ${mine?"text-white/70":"text-neutral-500"}`}>
                              {new Date(m.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={threadEndRef} />
                    {!currentThread.length && <div className="text-xs text-neutral-400">Aucun message. Sélectionne un contact.</div>}
                  </div>

                  {/* Input */}
                  <form
                    className="mt-2 flex items-center gap-2"
                    onSubmit={(e)=>{ e.preventDefault(); sendDirect(); }}
                  >
                    <input
                      className="flex-1 px-3 py-2 rounded border"
                      placeholder={selectedPartnerId ? "Votre message…" : "Sélectionnez un interlocuteur"}
                      disabled={!selectedPartnerId}
                      value={draftDm}
                      onChange={e=>setDraftDm(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded bg-[#bba28d] text-white disabled:opacity-50"
                      disabled={!selectedPartnerId || !draftDm.trim()}
                    >Envoyer</button>
                  </form>
                </div>
              </div>
            </SectionCard>
          </motion.div>
        )}
      </main>

      <footer className="text-center text-xs text-[#e6d9cb]/80 py-6">Prototype UI (mock). Auth, DB, RBAC, Realtime & RGPD à venir.</footer>
    </div>
  );
}

/* =========================
   Sous-composants UI
========================= */
function SectionCard({ title, children }:{title:string; children:React.ReactNode}) {
  return (
    <section
      className="rounded-[28px] overflow-hidden shadow-[0_6px_24px_rgba(0,0,0,0.25)]"
      style={{ background:"#eae0d1" }}
    >
      <header className="px-6 pt-6">
        <h2 className="text-3xl font-extrabold text-[#1b130e] tracking-wide text-center">{title}</h2>
      </header>
      <div className="mt-4 bg-[#efe6d8] border-t border-[#dcc7ac] px-5 pb-6 pt-4">
        {children}
      </div>
    </section>
  );
}

function TopBar({ meName, role, onLogout }:{meName:string; role:Role|null; onLogout:()=>void}) {
  return (
    <header className="border-b border-[#3a2a20]" style={{ background:"#efe6d8" }}>
      <div className="mx-auto max-w-7xl h-16 px-4 md:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/custom-caffe-logo.png" alt="Custom Caffe" width={44} height={44} className="rounded-full" />
          <span className="text-xl font-semibold" style={{ color:"#1b130e" }}>Portal RH - Custom Caffe</span>
        </div>
        <div className="flex items-center gap-3">
          {role ? <span className="text-xs px-2 py-0.5 rounded-full bg-[#ead8c0] capitalize">{role}</span>
                : <span className="text-xs px-2 py-0.5 rounded-full bg-[#ead8c0]">Non connecté</span>}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-[#d9c7b1] flex items-center justify-center text-sm font-bold" style={{ color:"#6f4e37" }}>
              {meName.slice(0,2).toUpperCase()}
            </div>
            <span className="text-sm" style={{ color:"#1b130e" }}>{meName}</span>
          </div>
          {role && <button onClick={onLogout} className="p-2 rounded hover:bg-[#e7dac8]" title="Se déconnecter">⎋</button>}
        </div>
      </div>
    </header>
  );
}

function AuthCard({ email, setEmail, password, setPassword, onLogin }:{
  email:string; setEmail:any; password:string; setPassword:any; onLogin:()=>void;
}) {
  return (
    <div className="mx-auto max-w-3xl grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <section className="rounded-[28px] overflow-hidden shadow-[0_6px_24px_rgba(0,0,0,0.25)]" style={{ background:"#eae0d1" }}>
        <header className="px-6 pt-6">
          <h2 className="text-3xl font-extrabold text-[#1b130e] tracking-wide text-center">Connexion</h2>
        </header>
        <div className="mt-4 bg-[#efe6d8] border-t border-[#dcc7ac] px-5 pb-6 pt-4">
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm">Email</label>
              <input className="w-full px-3 py-2 rounded border" value={email} onChange={e=>setEmail(e.target.value)} placeholder="employee@test.com"/>
            </div>
            <div className="space-y-1">
              <label className="text-sm">Mot de passe <span className="text-xs text-neutral-500">(non fonctionnel)</span></label>
              <input type="password" className="w-full px-3 py-2 rounded border" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"/>
            </div>
            <button className="w-full px-4 py-2 rounded bg-[#6f4e37] text-white" onClick={onLogin}>Entrer</button>
            <p className="text-xs text-neutral-600">Mock d’auth : tape l’email d’un compte de test ci-contre.</p>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] overflow-hidden shadow-[0_6px_24px_rgba(0,0,0,0.25)]" style={{ background:"#eae0d1" }}>
        <header className="px-6 pt-6">
          <h2 className="text-3xl font-extrabold text-[#1b130e] tracking-wide text-center">Comptes de test</h2>
        </header>
        <div className="mt-4 bg-[#efe6d8] border-t border-[#dcc7ac] px-5 pb-6 pt-4 text-sm space-y-2">
          <div className="flex items-center justify-between"><span>Employé</span><code className="px-2 py-0.5 rounded bg-[#ead8c0]">employee@test.com</code></div>
          <div className="flex items-center justify-between"><span>Manager</span><code className="px-2 py-0.5 rounded bg-[#ead8c0]">manager@test.com</code></div>
          <div className="flex items-center justify-between"><span>Admin</span><code className="px-2 py-0.5 rounded bg-[#ead8c0]">admin@test.com</code></div>
          <p className="text-xs text-neutral-600">Le mot de passe est ignoré.</p>
        </div>
      </section>
    </div>
  );
}

