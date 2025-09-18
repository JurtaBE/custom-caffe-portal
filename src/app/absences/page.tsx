// src/app/absences/page.tsx
'use client';
import Panel from "@/components/Panel";
import { useDB } from "@/components/store";
import { useMemo, useState } from "react";

export default function AbsencesPage(){
  const { me, users, absences, createAbs, decideAbs } = useDB();
  const [type,setType]=useState("CP"); const [from,setFrom]=useState(""); const [to,setTo]=useState(""); const [reason,setReason]=useState("");

  const isEmployee = me?.role==="employee";
  const isDirection = me && (me.role==="admin" || me.role==="manager");

  const pending = useMemo(()=>absences.filter(a=>a.status==="en_attente"),[absences]);
  const history = useMemo(()=>absences.filter(a=>a.status!=="en_attente"),[absences]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
      <Panel title="Nouvelle demande" height="h-[1000px]">
        {isEmployee ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 2xl:grid-cols-5 gap-4">
              <select className="px-3 py-3 rounded-lg border border-neutral-700 bg-[#0b0f15]" value={type} onChange={e=>setType(e.target.value)}>
                <option>CP</option><option>RTT</option><option>Maladie</option>
              </select>
              <input type="date" className="px-3 py-3 rounded-lg border border-neutral-700 bg-[#0b0f15]" value={from} onChange={e=>setFrom(e.target.value)}/>
              <input type="date" className="px-3 py-3 rounded-lg border border-neutral-700 bg-[#0b0f15]" value={to} onChange={e=>setTo(e.target.value)}/>
            </div>
            <textarea className="w-full min-h-[120px] px-4 py-3 rounded-lg border border-neutral-700 bg-[#0b0f15]" placeholder="Motif (optionnel)"
              value={reason} onChange={e=>setReason(e.target.value)}/>
            <button onClick={()=>{ if(!me||!from||!to) return; createAbs(me.id,type,from,to,reason); setFrom("");setTo("");setReason(""); }}
              className="px-6 py-3 rounded-lg bg-[#c7a27a] text-black font-semibold">Demander</button>
          </div>
        ) : <p className="text-neutral-400">Réservé aux employés.</p>}
      </Panel>

      <Panel title="Demandes / Historique" height="h-[1000px]">
        <section className="rounded-2xl border border-neutral-700 overflow-hidden">
          <header className="bg-[#141923] px-4 py-3 flex items-center gap-3">
            <h3 className="font-semibold">En attente</h3>
            <span className="text-[12px] px-2 py-0.5 rounded-full bg-[#0b0f15] border border-neutral-700">{pending.length}</span>
          </header>
          <div className="max-h-[300px] overflow-auto">
            <table className="w-full text-[15px]">
              <thead className="bg-[#141923] text-neutral-200 sticky top-0">
                <tr className="text-left"><th className="p-3">Employé</th><th className="p-3">Type</th><th className="p-3">Période</th><th className="p-3">Motif</th><th className="p-3 text-right">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {pending.map(a=>{
                  const u=users.find(x=>x.id===a.userId);
                  return (
                    <tr key={a.id} className="bg-[#0b0f15]">
                      <td className="p-3 font-medium">{u?.name}</td>
                      <td className="p-3">{a.type}</td>
                      <td className="p-3">{a.from} → {a.to}</td>
                      <td className="p-3 max-w-[320px] truncate" title={a.reason||""}>{a.reason||"—"}</td>
                      <td className="p-3 text-right space-x-3">
                        {isDirection ? (
                          <>
                            <button onClick={()=>decideAbs(a.id,"refusée", me!.id)}  className="px-3 py-1.5 rounded-lg border border-neutral-600 hover:bg-[#151b25]">Refuser</button>
                            <button onClick={()=>decideAbs(a.id,"approuvée", me!.id)} className="px-3 py-1.5 rounded-lg bg-[#c7a27a] text-black font-semibold hover:brightness-110">Approuver</button>
                          </>
                        ) : <span className="text-xs text-neutral-500">En attente</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-700 overflow-hidden mt-6 flex-1">
          <header className="bg-[#141923] px-4 py-3"><h3 className="font-semibold">Historique</h3></header>
          <div className="max-h-[550px] overflow-auto">
            <table className="w-full text-[15px]">
              <thead className="bg-[#141923] text-neutral-200 sticky top-0">
                <tr className="text-left"><th className="p-3">Employé</th><th className="p-3">Type</th><th className="p-3">Période</th><th className="p-3">Statut</th></tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {history.map(a=>{
                  const u=users.find(x=>x.id===a.userId);
                  const cls = a.status==="approuvée"?"bg-green-900/40 text-green-300 border-green-700":
                             a.status==="refusée"  ?"bg-red-900/40   text-red-300   border-red-700":
                                                   "bg-neutral-800  text-neutral-300 border-neutral-700";
                  const lab = a.status==="approuvée"?"Approuvée":a.status==="refusée"?"Refusée":"En attente";
                  const deciderName = a.decidedBy ? users.find(x=>x.id===a.decidedBy)?.name : undefined;
                  return (
                    <tr key={a.id} className="bg-[#0b0f15]">
                      <td className="p-3 font-medium">{u?.name}</td>
                      <td className="p-3">{a.type}</td>
                      <td className="p-3">{a.from} → {a.to}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-[12px] px-2 py-0.5 rounded-full border ${cls}`}>{lab}</span>
                          {deciderName && <span className="text-[12px] text-neutral-400">par {deciderName}</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </Panel>
    </div>
  );
}
