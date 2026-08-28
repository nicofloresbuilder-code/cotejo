"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

// Botón chico de "Iniciar sesión con Google" / "Cerrar sesión". El login
// nunca es requisito para cotejar — solo para guardar un cotejo (Commit 7).
export function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [cargando, setCargando] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setCargando(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  if (cargando) return null;

  if (user) {
    return (
      <button
        type="button"
        onClick={() => supabase.auth.signOut()}
        className="text-[11px] font-semibold text-muted underline underline-offset-2"
      >
        {user.email} · Cerrar sesión
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() =>
        supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: `${window.location.origin}/auth/callback` },
        })
      }
      className="text-[11px] font-semibold text-accent underline underline-offset-2"
    >
      Iniciar sesión con Google (para guardar)
    </button>
  );
}
