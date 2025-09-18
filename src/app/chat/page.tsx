'use client';

import AuthGate from "@/components/AuthGate";
import Panel from "@/components/Panel";
import { useDB } from "@/components/store";

export default function ChatPage() {
  const { messages, sendMessage, msgTxt, setMsgTxt, users, me } = useDB();

  return (
    <AuthGate>
      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-10">
        <Panel title="Direction">
          <div className="space-y-3">
            {messages.map(m => {
              const from = users.find(u => u.id === m.fromUserId);
              return (
                <div key={m.id} className="p-3 rounded-lg border border-neutral-700 bg-neutral-800">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{from?.name}</span>
                    <span className="text-xs text-neutral-400">
                      {new Date(m.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-neutral-200">{m.text}</p>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-2 mt-4">
            <input
              className="flex-1 px-3 py-2 rounded border border-neutral-700 bg-black text-white"
              placeholder="Votre message..."
              value={msgTxt}
              onChange={e => setMsgTxt(e.target.value)}
            />
            <button
              onClick={() => sendMessage("direction")}
              className="px-4 py-2 rounded bg-amber-600 text-white hover:bg-amber-700 transition"
            >
              Envoyer
            </button>
          </div>
        </Panel>
      </div>
    </AuthGate>
  );
}
