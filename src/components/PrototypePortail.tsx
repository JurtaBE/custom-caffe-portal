
'use client';
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
type Role = "employee" | "manager" | "admin";
interface UserT { id:string; email:string; name:string; role:Role; active?:boolean }
interface AnnouncementT { id:string; title:string; content:string; createdBy:string; createdAt:string }
interface AbsenceT { id:string; userId:string; type:string; from:string; to:string; reason:string; status:"en_attente"|"approuvée"|"refusée"; decidedBy?:string; decidedAt?:string }
interface MessageT { id:string; fromUserId:string; toChannel:"direction"|"employes"; text:string; createdAt:string }
const seedUsers:UserT[]=[
  {id:"u1",email:"employee@test.com",name:"Alice Martin",role:"employee",active:true},
  {id:"u2",email:"manager@test.com",name:"Bruno Lefevre",role:"manager",active:true},
  {id:"u3",email:"admin@test.com",name:"Chloé Dubois",role:"admin",active:true},
  {id:"u4",email:"paul@exemple.com",name:"Paul Noël",role:"employee",active:true},
];
const nowISO=()=>new Date().toISOString(); const rid=()=>Math.random().toString(36).slice(2,10);

export default function PrototypePortail(){
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [currentUser,setCurrentUser]=useState<UserT|null>(null);
  const [users,setUsers]=useState<UserT[]>(seedUsers);
  const [annonces,setAnnonces]=useState<AnnouncementT[]>([{id:rid(),title:"Nouvelle charte sécurité",content:"Casques obligatoires en zone A.",createdBy:"u3",createdAt:nowISO()},{id:rid(),title:"Prime de performance",content:"Versement prévu fin du mois.",createdBy:"u2",createdAt:nowISO()}]);
  const [absences,setAbsences]=useState<AbsenceT[]>([{id:rid(),userId:"u1",type:"CP",from:"2025-09-22",to:"2025-09-24",reason:"Vacances",status:"en_attente"},{id:rid(),userId:"u4",type:"RTT",from:"2025-09-19",to:"2025-09-19",reason:"RDV médical",status:"en_attente"}]);
  const [messages,setMessages]=useState<MessageT[]>([{id:rid(),fromUserId:"u1",toChannel:"direction",text:"Peut-on avoir des gants taille S ?",createdAt:nowISO()},{id:rid(),fromUserId:"u2",toChannel:"employes",text:"Brief sécurité demain 8h.",createdAt:nowISO()}]);
  const currentRole:Role|null=currentUser?.role??null; const isAdmin=currentRole==="admin"; const isManager=currentRole==="manager"; const isEmployee=currentRole==="employee"; const meName=currentUser?.name??"Invité";
  const handleLogin=()=>{ const found=users.find(u=>u.email.toLowerCase()===email.toLowerCase()); if(!found){ alert("Utilisateur inconnu. Utilisez un compte de test."); return;} setCurrentUser(found); };
  const handleLogout=()=>setCurrentUser(null);
  const [newAnn,setNewAnn]=useState({title:"",content:""}); const publishAnn=()=>{ if(!currentUser) return; if(!newAnn.title.trim()||!newAnn.content.trim()) return; setAnnonces(p=>[{id:rid(),title:newAnn.title,content:newAnn.content,createdBy:currentUser.id,createdAt:nowISO()},...p]); setNewAnn({title:"",content:""}); };
  const [newAbs,setNewAbs]=useState({type:"CP",from:"",to:"",reason:""}); const submitAbs=()=>{ if(!currentUser) return; if(!newAbs.from||!newAbs.to) return; setAbsences(p=>[{id:rid(),userId:currentUser.id,type:newAbs.type,from:newAbs.from,to:newAbs.to,reason:newAbs.reason,status:"en_attente"},...p]); setNewAbs({type:"CP",from:"",to:"",reason:""}); };
  const decideAbs=(id:string,d:"approuvée"|"refusée")=>{ if(!currentUser) return; setAbsences(p=>p.map(a=>a.id===id?{...a,status:d,decidedBy:currentUser.id,decidedAt:nowISO()}:a)); };
  const [msgTxt,setMsgTxt]=useState(""); const sendMsgTo=(ch:"direction"|"employes")=>{ if(!currentUser||!msgTxt.trim()) return; setMessages(p=>[{id:rid(),fromUserId:currentUser.id,toChannel:ch,text:msgTxt.trim(),createdAt:nowISO()},...p]); setMsgTxt(""); };
  const [empDraft,setEmpDraft]=useState({name:"",email:"",role:"employee" as Role,active:true}); const addEmployee=()=>{ if(!empDraft.name||!empDraft.email) return; setUsers(p=>[...p,{id:rid(),name:empDraft.name,email:empDraft.email,role:empDraft.role,active:empDraft.active}]); setEmpDraft({name:"",email:"",role:"employee",active:true}); };
  const toggleActive=(uid:string)=>setUsers(p=>p.map(u=>u.id===uid?{...u,active:!u.active}:u));
  const team=useMemo(()=>users.filter(u=>u.role!=="admin"),[users]); const pendingAbs=useMemo(()=>absences.filter(a=>a.status==="en_attente"),[absences]);
  return (<div className="min-h-screen">
    <TopBar meName={meName} role={currentRole} onLogout={handleLogout}/>
    <main className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
      {!currentUser? <AuthCard email={email} setEmail={setEmail} password={password} setPassword={setPassword} onLogin={handleLogin}/> :
      <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} className="grid gap-6 lg:gap-8 grid-cols-1 lg:grid-cols-3">
        <section className="rounded-2xl border border-[#d3bfa6] bg-white shadow-sm">
          <header className="p-4 border-b border-[#ecdcc7] flex items-center gap-2"><span className="font-semibold text-lg">Annonces</span></header>
          <div className="p-4 space-y-4">
            {(isAdmin||isManager) && <div className="space-y-2 p-3 border rounded-xl bg-[#fffdf8]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input className="px-3 py-2 rounded border" placeholder="Titre" value={newAnn.title} onChange={e=>setNewAnn({...newAnn,title:e.target.value})}/>
                <button onClick={publishAnn} className="justify-self-end px-4 py-2 rounded bg-[#6f4e37] text-white">Publier</button>
                <div className="md:col-span-2"><textarea className="w-full px-3 py-2 rounded border" placeholder="Contenu" value={newAnn.content} onChange={e=>setNewAnn({...newAnn,content:e.target.value})}/></div>
              </div>
              <p className="text-xs text-neutral-500">Visibles par tout le monde. Temps réel prévu en prod.</p>
            </div>}
            <div className="max-h-[420px] overflow-auto pr-3 space-y-3">
              {annonces.map(a=>(<div key={a.id} className="p-3 rounded-xl border bg-white">
                <div className="flex items-center justify-between"><h4 className="font-semibold">{a.title}</h4><span className="text-xs px-2 py-0.5 rounded-full bg-[#f0e4d7] text-[#6f4e37]">{new Date(a.createdAt).toLocaleDateString()}</span></div>
                <p className="text-sm text-neutral-700 mt-1">{a.content}</p>
              </div>))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#d3bfa6] bg-white shadow-sm">
          <header className="p-4 border-b border-[#ecdcc7] flex items-center gap-2"><span className="font-semibold text-lg">Absences</span></header>
          <div className="p-4 space-y-4">
            {isEmployee && <div className="p-3 border rounded-xl bg-[#fffdf8] space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <select className="px-3 py-2 rounded border" value={newAbs.type} onChange={e=>setNewAbs({...newAbs,type:e.target.value})}><option>CP</option><option>RTT</option><option>Maladie</option></select>
                <input type="date" className="px-3 py-2 rounded border" value={newAbs.from} onChange={e=>setNewAbs({...newAbs,from:e.target.value})}/>
                <input type="date" className="px-3 py-2 rounded border" value={newAbs.to} onChange={e=>setNewAbs({...newAbs,to:e.target.value})}/>
                <button onClick={submitAbs} className="justify-self-end px-4 py-2 rounded bg-[#6f4e37] text-white">Demander</button>
              </div>
              <textarea className="w-full px-3 py-2 rounded border" placeholder="Motif (optionnel)" value={newAbs.reason} onChange={e=>setNewAbs({...newAbs,reason:e.target.value})}/>
              <p className="text-xs text-neutral-500">Un email/Discord pourra être envoyé en prod lors de la création.</p>
            </div>}

            {(isManager||isAdmin) && <div className="space-y-2">
              <div className="flex items-center justify-between"><h4 className="font-semibold">Demandes en attente</h4><span className="text-xs px-2 py-0.5 rounded-full bg-[#f0e4d7] text-[#6f4e37]">{pendingAbs.length}</span></div>
              <div className="rounded-xl border overflow-hidden">
                <table className="w-full text-sm"><thead className="bg-[#f7efe4]"><tr className="text-left"><th className="p-2">Employé</th><th className="p-2">Type</th><th className="p-2">Du</th><th className="p-2">Au</th><th className="p-2">Motif</th><th className="p-2 text-right">Action</th></tr></thead><tbody>
                  {pendingAbs.map(a=>{const u=users.find(x=>x.id===a.userId);return(<tr key={a.id} className="border-t"><td className="p-2 font-medium">{u?.name}</td><td className="p-2">{a.type}</td><td className="p-2">{a.from}</td><td className="p-2">{a.to}</td><td className="p-2 max-w-[160px] truncate" title={a.reason}>{a.reason||"—"}</td><td className="p-2 text-right space-x-2"><button onClick={()=>decideAbs(a.id,"refusée")} className="px-3 py-1 rounded border">Refuser</button><button onClick={()=>decideAbs(a.id,"approuvée")} className="px-3 py-1 rounded bg-[#6f4e37] text-white">Approuver</button></td></tr>);})}
                </tbody></table>
              </div>
            </div>}

            <div className="space-y-2"><h4 className="font-semibold">Suivi</h4>
              <div className="rounded-xl border overflow-hidden">
                <table className="w-full text-sm"><thead className="bg-[#f7efe4]"><tr className="text-left"><th className="p-2">Employé</th><th className="p-2">Type</th><th className="p-2">Période</th><th className="p-2">Statut</th></tr></thead><tbody>
                  {absences.map(a=>{const u=users.find(x=>x.id===a.userId); const s=a.status==="approuvée"?"bg-green-100 text-green-700":a.status==="refusée"?"bg-red-100 text-red-700":"bg-gray-100 text-gray-700"; const lab=a.status==="en_attente"?"En attente":a.status==="approuvée"?"Approuvée":"Refusée"; return(<tr key={a.id} className="border-t"><td className="p-2 font-medium">{u?.name}</td><td className="p-2">{a.type}</td><td className="p-2">{a.from} → {a.to}</td><td className="p-2"><span className={`text-xs px-2 py-0.5 rounded-full ${s}`}>{lab}</span></td></tr>);})}
                </tbody></table>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-2xl border border-[#d3bfa6] bg-white shadow-sm">
            <header className="p-4 border-b border-[#ecdcc7] flex items-center gap-2"><span className="font-semibold text-lg">Messagerie</span></header>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <input className="flex-1 px-3 py-2 rounded border" placeholder="Votre message…" value={msgTxt} onChange={e=>setMsgTxt(e.target.value)}/>
                {isEmployee && <button onClick={()=>sendMsgTo("direction")} className="px-4 py-2 rounded bg-[#6f4e37] text-white">Envoyer</button>}
                {(isManager||isAdmin) && <button onClick={()=>sendMsgTo("employes")} className="px-4 py-2 rounded bg-[#6f4e37] text-white">Diffuser</button>}
              </div>
              <div className="max-h-[220px] overflow-auto pr-3 space-y-3">
                {messages.map(m=>{const from=users.find(u=>u.id===m.fromUserId); return(<div key={m.id} className="flex items-start gap-3 p-2 rounded-lg border bg-white"><div className="h-8 w-8 rounded-full bg-[#f0e4d7] flex items-center justify-center text-sm font-semibold text-[#6f4e37]">{(from?.name||'?').slice(0,2).toUpperCase()}</div><div className="flex-1"><div className="flex items-center gap-2"><span className="font-medium">{from?.name}</span><span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100">{m.toChannel==="direction"?"→ Direction":"→ Employés"}</span><span className="text-xs text-neutral-500 ml-auto">{new Date(m.createdAt).toLocaleTimeString()}</span></div><p className="text-sm text-neutral-700">{m.text}</p></div></div>);})}
              </div>
            </div>
          </div>

          {isAdmin && <div className="rounded-2xl border border-[#d3bfa6] bg-white shadow-sm">
            <header className="p-4 border-b border-[#ecdcc7] flex items-center gap-2"><span className="font-semibold text-lg">Gestion des employés</span></header>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2 p-3 border rounded-xl bg-[#fffdf8]">
                <input className="px-3 py-2 rounded border" placeholder="Nom" value={empDraft.name} onChange={e=>setEmpDraft({...empDraft,name:e.target.value})}/>
                <input className="px-3 py-2 rounded border" placeholder="Email" value={empDraft.email} onChange={e=>setEmpDraft({...empDraft,email:e.target.value})}/>
                <select className="px-3 py-2 rounded border" value={empDraft.role} onChange={e=>setEmpDraft({...empDraft,role:e.target.value as Role})}><option value="employee">Employé</option><option value="manager">Manager</option><option value="admin">Admin</option></select>
                <div className="flex items-center gap-2"><input id="active" type="checkbox" checked={empDraft.active} onChange={e=>setEmpDraft({...empDraft,active:e.target.checked})}/><label htmlFor="active" className="text-sm">Actif</label></div>
                <button onClick={addEmployee} className="justify-self-end px-4 py-2 rounded bg-[#6f4e37] text-white">Ajouter</button>
              </div>
              <div className="rounded-xl border overflow-hidden">
                <table className="w-full text-sm"><thead className="bg-[#f7efe4]"><tr className="text-left"><th className="p-2">Nom</th><th className="p-2">Email</th><th className="p-2">Rôle</th><th className="p-2">Statut</th><th className="p-2 text-right">Action</th></tr></thead><tbody>{team.map(u=>(<tr key={u.id} className="border-t"><td className="p-2 font-medium">{u.name}</td><td className="p-2">{u.email}</td><td className="p-2"><span className="text-xs px-2 py-0.5 rounded-full bg-gray-100">{u.role}</span></td><td className="p-2"><span className={`text-xs px-2 py-0.5 rounded-full ${u.active?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{u.active?'Actif':'Inactif'}</span></td><td className="p-2 text-right"><button onClick={()=>toggleActive(u.id)} className="px-3 py-1 rounded border">{u.active?'Désactiver':'Activer'}</button></td></tr>))}</tbody></table>
              </div>
            </div>
          </div>}
        </section>
      </motion.div>}
    </main>
    <div className="text-center text-xs text-neutral-500 py-6">Prototype UI (mock). Auth, DB, RBAC, Realtime & RGPD à venir.</div>
  </div>);
}

function TopBar({meName,role,onLogout}:{meName:string;role:Role|null;onLogout:()=>void}){
  return (<header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur">
    <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 h-14 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="font-semibold">Portail RH</span>
        <span className="mx-2 h-5 w-px bg-[#d3bfa6] inline-block" />
        <span className="text-sm text-neutral-600 hidden md:inline">1 écran • Connexion • Employé • Direction</span>
      </div>
      <div className="flex items-center gap-3">
        {role? <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 capitalize">{role}</span> : <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100">Non connecté</span>}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-[#f0e4d7] flex items-center justify-center text-sm font-semibold text-[#6f4e37]">{meName.slice(0,2).toUpperCase()}</div>
          <span className="text-sm">{meName}</span>
        </div>
        {role && <button onClick={onLogout} className="p-2 rounded hover:bg-neutral-100" title="Se déconnecter">⎋</button>}
      </div>
    </div>
  </header>);
}

function AuthCard({email,setEmail,password,setPassword,onLogin}:{email:string;setEmail:any;password:string;setPassword:any;onLogin:()=>void}){
  return (<div className="mx-auto max-w-3xl grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
    <div className="rounded-2xl border border-[#d3bfa6] bg-white shadow-sm">
      <div className="p-4 border-b border-[#ecdcc7] flex items-center gap-2"><span className="font-semibold text-lg">Connexion</span></div>
      <div className="p-4 space-y-3">
        <div className="space-y-2"><label className="text-sm">Email</label><input className="w-full px-3 py-2 rounded border" value={email} onChange={e=>setEmail(e.target.value)} placeholder="employee@test.com"/></div>
        <div className="space-y-2"><label className="text-sm">Mot de passe <span className="text-xs text-neutral-500">(non fonctionnel)</span></label><input type="password" className="w-full px-3 py-2 rounded border" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"/></div>
        <button className="w-full px-4 py-2 rounded bg-[#6f4e37] text-white" onClick={onLogin}>Entrer</button>
        <p className="text-xs text-neutral-500">Ce formulaire est un mock : aucune authentification réelle n'est effectuée.</p>
      </div>
    </div>
    <div className="rounded-2xl border border-[#d3bfa6] bg-white shadow-sm">
      <div className="p-4 border-b border-[#ecdcc7]"><span className="font-semibold text-lg">Comptes de test</span></div>
      <div className="p-4 text-sm space-y-2">
        <div className="flex items-center justify-between"><span>Employé</span><code className="px-2 py-0.5 rounded bg-gray-100">employee@test.com</code></div>
        <div className="flex items-center justify-between"><span>Manager</span><code className="px-2 py-0.5 rounded bg-gray-100">manager@test.com</code></div>
        <div className="flex items-center justify-between"><span>Admin</span><code className="px-2 py-0.5 rounded bg-gray-100">admin@test.com</code></div>
        <p className="text-xs text-neutral-500">Tape l'email correspondant, le mot de passe est ignoré.</p>
      </div>
    </div>
  </div>);
}
