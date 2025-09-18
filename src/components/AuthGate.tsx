// src/components/AuthGate.tsx
'use client';

import { useDB } from "@/components/store";

/**
 * Garde d'accès simple :
 * - Si pas hydraté → on n'affiche rien (évite un faux "déco").
 * - Si pas connecté → on affiche un message + lien.
 * - Si connecté → on affiche la page.
 * NB : pas de router.replace ici, ça évite les boucles / reconnects.
 */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { me, hydrated } = useDB();

  if (!hydrated) return null;

  if (!me) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="text-center space-y-3">
          <h2 className="text-xl font-semibold">Veuillez vous connecter</h2>
          <a href="/" className="inline-block px-4 py-2 rounded-lg border border-neutral-700 hover:bg-neutral-800">
            Aller à la page de connexion
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
