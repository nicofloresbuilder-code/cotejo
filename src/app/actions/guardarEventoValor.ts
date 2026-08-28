"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  ACCIONES,
  DISPOSICIONES_PAGO,
  type EventoValorEntrada,
} from "@/lib/eventoValor";

export type GuardarEventoResultado = { ok: boolean; error?: string };

// Commit 6: inserta un evento ANÓNIMO — sin user_id, sin ningún dato de la
// contraparte (nombre, RFC, CLABE...), solo agregados. Usa el cliente
// admin (service role) a propósito: `value_events` no tiene policy de
// insert para el cliente normal (ver supabase/migrations/0001_init.sql),
// así que esto solo puede pasar desde un server action, nunca desde el
// browser directo.
export async function guardarEventoValor(
  entrada: EventoValorEntrada,
): Promise<GuardarEventoResultado> {
  if (!ACCIONES.includes(entrada.accion)) {
    return { ok: false, error: "Acción inválida." };
  }
  if (entrada.disposicionPago !== null && !DISPOSICIONES_PAGO.includes(entrada.disposicionPago)) {
    return { ok: false, error: "Disposición a pagar inválida." };
  }
  if (entrada.tiempoSegundos < 0 || entrada.nEvidencias < 2 || entrada.nEvidencias > 4) {
    return { ok: false, error: "Datos del evento fuera de rango." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("value_events").insert({
    monto_mxn: entrada.montoMxn,
    tiempo_segundos: entrada.tiempoSegundos,
    n_evidencias: entrada.nEvidencias,
    distribucion: entrada.distribucion,
    accion: entrada.accion,
    disposicion_pago: entrada.disposicionPago,
  });

  if (error) {
    console.error("[guardarEventoValor]", error.message);
    return { ok: false, error: "No se pudo guardar el evento." };
  }
  return { ok: true };
}
