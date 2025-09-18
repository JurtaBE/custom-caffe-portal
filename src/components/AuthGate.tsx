// src/components/AuthGate.tsx
'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDB } from "@/components/store";

/**
 * Protège une page : si l'utilisateur n'est pas connecté,
 * on le redirige vers "/" (page de connexion) et on ne rend rien.
 */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { me } = useDB();
  const router = useRouter();

  useEffect(() => {
    if (!me) router.replace("/");
  }, [me, router]);

  if (!me) return null; // Rien tant que redirection
  return <>{children}</>;
}
