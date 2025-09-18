// src/components/AuthGate.tsx
'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDB } from "@/components/store";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { me, hydrated } = useDB();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !me) router.replace("/");
  }, [hydrated, me, router]);

  // Attendre le chargement du localStorage pour éviter une fausse redirection
  if (!hydrated) return null;
  if (!me) return null;

  return <>{children}</>;
}
