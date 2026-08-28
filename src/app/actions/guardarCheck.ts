"use server";

import { createClient } from "@/lib/supabase/server";
import type { CampoCanonico, ResultadoCampo } from "@/lib/cotejo/cotejarDocumentos";

export type GuardarCheckResultado = { ok: boolean; error?: string };

// Commit 7: guarda un cotejo bajo la cuenta del usuario — a diferencia de
// guardarEventoValor, este SÍ usa el cliente normal (respeta RLS), nunca
// el admin: la policy "usuario guarda sus propios cotejos" (auth.uid() =
// user_id) es la que decide si esto pasa, no el código. Sin sesión,
// regresa un error claro — nunca intenta adivinar o crear una.
export async function guardarCheck(
  campos: Record<CampoCanonico, ResultadoCampo>,
  nEvidencias: number,
): Promise<GuardarCheckResultado> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Inicia sesión para guardar este cotejo." };
  }

  const { error } = await supabase.from("checks").insert({
    user_id: user.id,
    campos,
    n_evidencias: nEvidencias,
  });

  if (error) {
    console.error("[guardarCheck]", error.message);
    return { ok: false, error: "No se pudo guardar el cotejo." };
  }
  return { ok: true };
}
