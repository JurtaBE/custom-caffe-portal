'use client';

import AuthGate from "@/components/AuthGate";
import Panel from "@/components/Panel";
import { useDB } from "@/components/store";

export default function AnnoncesPage() {
  const { annonces, publishAnnonce, newAnn, setNewAnn, me, isAdmin, isManager } = useDB();

  return (
    <AuthGate>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        <Panel title="Annonces">
          {(isAdmin || isManager) && (
            <div className="space-y-3 p-4 border border-neutral-700 rounded-xl bg-neutral-900">
              <input
                className="px-3 py-2 w-full rounded border border-neutral-700 bg-black text-white"
                placeholder="Titre"
                value={newAnn.title}
                onChange={e => setNewAnn({ ...newAnn, title: e.target.value })}
              />
              <textarea
                className="px-3 py-2 w-full rounded border border-neutral-700 bg-black text-white"
                placeholder="Contenu"
                value={newAnn.content}
                onChange={e => setNewAnn({ ...newAnn, content: e.target.value })}
              />
              <button
                onClick={publishAnnonce}
                className="w-full px-4 py-2 rounded bg-amber-600 text-white hover:bg-amber-700 transition"
              >
                Publier
              </button>
            </div>
          )}

          <div className="space-y-3 mt-6">
            {annonces.map(a => (
              <div key={a.id} className="p-3 rounded-xl border border-neutral-700 bg-neutral-800">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{a.title}</h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-700 text-white">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-neutral-300 mt-1">{a.content}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </AuthGate>
  );
}
