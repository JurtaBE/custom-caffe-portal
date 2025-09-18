// src/components/store.ts
'use client';
import { useEffect, useState } from "react";

/* ================= Types & Constantes ================= */
export type Role = "employee" | "manager" | "admin";
export type FileMeta = { name:string; url:string; type:string; size:number };
export const GROUP_DIRECTION = "__direction__";

export interface User { id:string; email:string; name:string; role:Role; active?:boolean }
export interface Announcement { id:string; title:string; content:string; createdBy:string; createdAt:string }
export interface Absence {
  id:string; userId:string; type:string; from:string; to:string; reason:string;
  status:"en_attente"|"approuvée"|"refusée"; decidedBy?:string; decidedAt?:string
}
export interface DM { id:string; fromUserId:string; toUserId:string; text:string; createdAt:string; files?:FileMeta[] }

type DB = {
  users:User[];
  annonces:Announcement[];
  absences:Absence[];
  dms:DM[];
  unread: Record<string, number>; // threadId -> count
  meId?: string;
};

const KEY = "ccaffe_portal_db_v1";

/* ================= Helpers ================= */
const rid = () => Math.random().toString(36).slice(2,10);
const now = () => new Date().toISOString();

/* ================= Données seed (mock) ================= */
const seedUsers:User[] = [
  { id:"u1", email:"employee@test.com", name:"Alice Martin",  role:"employee", active:true },
  { id:"u2", email:"manager@test.com",  name:"Bruno Lefevre", role:"manager",  active:true },
  { id:"u3", email:"admin@test.com",    name:"Chloé Dubois",  role:"admin",    active:true },
  { id:"u4", email:"paul@exemple.com",  name:"Paul Noël",     role:"employee", active:true },
];

export const passwords: Record<string,string> = {
  "employee@test.com":"test123",
  "manager@test.com":"test123",
  "admin@test.com":"test123",
  "paul@exemple.com":"test123",
};

const SEED:DB = {
  users: seedUsers,
  annonces: [
    {id:rid(), title:"Nouvelle charte sécurité", content:"Casques obligatoires en zone A.", createdBy:"u3", createdAt:now()},
    {id:rid(), title:"Prime de performance", content:"Versement prévu fin du mois.", createdBy:"u2", createdAt:now()},
  ],
  absences: [
    {id:rid(), userId:"u1", type:"Maladie", from:"2025-09-18", to:"2025-09-25", reason:"", status:"en_attente"},
    {id:rid(), userId:"u1", type:"CP",      from:"2025-09-22", to:"2025-09-24", reason:"Vacances", status:"en_attente"},
    {id:rid(), userId:"u4", type:"RTT",     from:"2025-09-19", to:"2025-09-19", reason:"RDV médical", status:"en_attente"},
  ],
  dms: [
    {id:rid(), fromUserId:"u1", toUserId:GROUP_DIRECTION, text:"Peut-on avoir des gants taille S ?", createdAt:now()},
    {id:rid(), fromUserId:"u2", toUserId:"u1",           text:"Brief sécurité demain 8h.",           createdAt:now()},
  ],
  unread: {},
};

/* ================= Store persistant (localStorage) ================= */
export function useDB() {
  const [db,setDb] = useState<DB>(SEED);
  const [hydrated, setHydrated] = useState(false); // flag d’hydratation

  // Charger depuis localStorage (et marquer hydraté APRÈS application)
  useEffect(()=>{
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as DB;
        setDb(parsed);
        // Laisser React appliquer l'état avant de signaler "hydrated"
        setTimeout(()=>setHydrated(true), 0);
        return;
      }
    } catch {}
    // Pas de storage -> on est sur SEED
    setHydrated(true);
  },[]);

  // Sauvegarde continue
  useEffect(()=>{
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch {}
  },[db]);

  const users = db.users;
  const me = users.find(u=>u.id===db.meId) ?? null;

  /* ============== Auth (mock) ============== */
  function login(email:string, pwd:string){
    const u = users.find(x=>x.email.toLowerCase()===email.toLowerCase());
    if(!u) throw new Error("Email inconnu");
    if(passwords[u.email] !== pwd) throw new Error("Mot de passe invalide");
    setDb(prev=>({...prev, meId:u.id}));
    return u;
  }
  function logout(){
    setDb(prev=>({...prev, meId:undefined}));
  }

  /* ============== Annonces ============== */
  function addAnnouncement(title:string, content:string, createdBy:string){
    setDb(prev=>({
      ...prev,
      annonces:[{id:rid(), title, content, createdBy, createdAt:now()}, ...prev.annonces]
    }));
  }

  /* ============== Absences ============== */
  function createAbs(userId:string, type:string, from:string, to:string, reason:string){
    setDb(prev=>({
      ...prev,
      absences:[{id:rid(), userId, type, from, to, reason, status:"en_attente"}, ...prev.absences]
    }));
  }
  function decideAbs(id:string, status:"approuvée"|"refusée", deciderId:string){
    setDb(prev=>({
      ...prev,
      absences: prev.absences.map(a=>a.id===id ? {...a, status, decidedBy:deciderId, decidedAt:now()} : a)
    }));
  }

  /* ============== Messagerie (DM + Groupe Direction) ============== */
  function sendDM(fromId:string, toId:string, text:string, files?:FileMeta[]){
    setDb(prev=>{
      const msg:DM = { id:rid(), fromUserId:fromId, toUserId:toId, text, createdAt:now(), files };
      const unread = { ...prev.unread };
      unread[toId] = (unread[toId] || 0) + 1; // incrémente le compteur du thread destinataire
      return { ...prev, dms:[...prev.dms, msg], unread };
    });
  }
  function resetUnread(threadId:string){
    setDb(prev=>({ ...prev, unread: { ...prev.unread, [threadId]: 0 } }));
  }

  return {
    // état & hydratation
    hydrated,
    db, users, me,
    // auth
    login, logout,
    // annonces
    annonces: db.annonces, addAnnouncement,
    // absences
    absences: db.absences, createAbs, decideAbs,
    // chat
    dms: db.dms, sendDM, unread: db.unread, resetUnread,
  };
}
