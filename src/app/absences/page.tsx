'use client';

import AuthGate from "@/components/AuthGate";
import Panel from "@/components/Panel";
import { useDB } from "@/components/store";

export default function AbsencesPage() {
  const { absences, pendingAbs, newAbs, setNewAbs, submitAbs, decideAbs, users, me, isEmployee, isManager, isAdmin } = useDB();

  return (
    <AuthGate>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        <Panel title="Absences">
          {isEmployee && (
            <div className="p-3 border border-neutral-700 rounded-xl bg-neutral-900 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <select
                  className="px-3 py-2 rounded border border-neutral-700 bg-black text-white"
                  value={newAbs.type}
                  onChange={e => setNewAbs({ ...newAbs, type: e.target.value })}
                >
                  <option>CP</option>
                  <option>RTT</option>
                  <option>Maladie</option>
                </select>
                <input
                  type="date"
                  className="px-3 py-2 rounded border border-neutral-700 bg-black text-white"
                  value={newAbs.from}
                  onChange={e => setNewAbs({ ...newAbs, from: e.target.value })}
                />
                <input
                  type="date"
                  className="px-3 py-2 rounded border border-neutral-700 bg-black text-white"
                  value={newAbs.to}
                  onChange={e => setNewAbs({ ...newAbs, to: e.target.value })}
                />
                <button
                  onClick={submitAbs}
                  className="justify-self-end px-4 py-2 rounded bg-amber-600 text-white hover:bg-amber-700 transition"
                >
                  Demander
                </button>
              </div>
              <textarea
                className="w-full px-3 py-2 rounded border border-neutral-700 bg-black text-white"
                placeholder="Motif (optionnel)"
                value={newAbs.reason}
                onChange={e => setNewAbs({ ...newAbs, reason: e.target.value })}
              />
            </div>
          )}

          {(isManager || isAdmin) && pendingAbs.length > 0 && (
            <div className="space-y-2 mt-4">
              <h4 className="font-semibold">Demandes en attente</h4>
              <div className="rounded-xl border border-neutral-700 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-800">
                    <tr className="text-left">
                      <th className="p-2">Employé</th>
                      <th className="p-2">Type</th>
                      <th className="p-2">Du</th>
                      <th className="p-2">Au</th>
                      <th className="p-2">Motif</th>
                      <th className="p-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingAbs.map(a => {
                      const u = users.find(x => x.id === a.userId);
                      return (
                        <tr key={a.id} className="border-t border-neutral-700">
                          <td className="p-2">{u?.name}</td>
                          <td className="p-2">{a.type}</td>
                          <td className="p-2">{a.from}</td>
                          <td className="p-2">{a.to}</td>
                          <td className="p-2 max-w-[120px] truncate">{a.reason || "—"}</td>
                          <td className="p-2 text-right space-x-2">
                            <button
                              onClick={() => decideAbs(a.id, "refusée")}
                              className="px-3 py-1 rounded border border-neutral-600 text-neutral-400 hover:bg-neutral-700"
                            >
                              Refuser
                            </button>
                            <button
                              onClick={() => decideAbs(a.id, "approuvée")}
                              className="px-3 py-1 rounded bg-amber-600 text-white hover:bg-amber-700"
                            >
                              Approuver
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <h4 className="mt-6 font-semibold">Suivi</h4>
          <div className="rounded-xl border border-neutral-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-800">
                <tr className="text-left">
                  <th className="p-2">Employé</th>
                  <th className="p-2">Type</th>
                  <th className="p-2">Période</th>
                  <th className="p-2">Statut</th>
                </tr>
              </thead>
              <tbody>
                {absences.map(a => {
                  const u = users.find(x => x.id === a.userId);
                  return (
                    <tr key={a.id} className="border-t border-neutral-700">
                      <td className="p-2">{u?.name}</td>
                      <td className="p-2">{a.type}</td>
                      <td className="p-2">{a.from} → {a.to}</td>
                      <td className="p-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${a.status === "approuvée" ? "bg-green-900 text-green-300" : a.status === "refusée" ? "bg-red-900 text-red-300" : "bg-neutral-700 text-neutral-300"}`}>
                          {a.status === "approuvée" ? "Approuvée" : a.status === "refusée" ? "Refusée" : "En attente"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </AuthGate>
  );
}
