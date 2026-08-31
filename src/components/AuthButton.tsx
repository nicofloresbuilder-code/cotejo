"use client";

import { createClient } from "@/lib/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";

// Botón chico de "Iniciar sesión con Google" / "Cerrar sesión". El login
// nunca es requisito para cotejar — solo para guardar un cotejo (Commit 7).
export function AuthButton() {
  const { user, cargando } = useAuthUser();
  const supabase = createClient();

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
          options: {
            // Regresa a la pantalla donde estaba, no al inicio — si estaba
            // a media captura, perder el contexto es perder el cotejo.
            redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
              window.location.pathname,
            )}`,
          },
        })
      }
      className="text-[11px] font-semibold text-accent underline underline-offset-2"
    >
      Iniciar sesión con Google (para guardar)
    </button>
  );
}
