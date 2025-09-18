// src/components/AuthGate.tsx
'use client';

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useDB } from "./store";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { me } = useDB();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Pas connecté → on renvoie vers la page d'accueil/connexion
    if (!me) {
      if (pathname !== "/") router.replace("/");
    }
  }, [me, pathname, router]);

  // Tant qu'on n'est pas connecté, on n'affiche rien (écran vide)
  if (!me) return null;

  return <>{children}</>;
}
