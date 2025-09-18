// src/components/AuthGate.tsx
'use client';

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDB } from "@/components/store";

const STORAGE_KEY = "ccaffe_portal_db_v1";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { me, hydrated } = useDB();
  const router = useRouter();

  // Vérifie directement le localStorage pour voir si un meId existe déjà
  const hasStoredSession = useMemo(()=>{
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return !!parsed?.meId;
    } catch { return false; }
  }, [hydrated]); // recalcul après hydratation

  useEffect(() => {
    // On ne redirige que si :
    // - l'hydratation est terminée
    // - ET qu'on n'a pas d'utilisateur
    // - ET qu'il n'y a PAS de session en storage (meId)
    if (hydrated && !me && !hasStoredSession) {
      router.replace("/");
    }
  }, [hydrated, me, hasStoredSession, router]);

  // 1) Pas encore hydraté -> ne rien rendre
  if (!hydrated) return null;

  // 2) Hydraté mais le store du hook n'a pas encore mis "me" à jour,
  //    alors qu'une session existe en localStorage -> on attend sans rediriger.
  if (!me && hasStoredSession) return null;

  // 3) Vraiment pas connecté -> on laisse l'effet faire la redirection.
  if (!me) return null;

  return <>{children}</>;
}
