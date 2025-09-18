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
    // Pas connecté → redirection vers la page de connexion "/"
    if (!me && pathname !== "/") router.replace("/");
  }, [me, pathname, router]);

  // Masque le contenu tant que non connecté
  if (!me) return null;

  return <>{children}</>;
}
