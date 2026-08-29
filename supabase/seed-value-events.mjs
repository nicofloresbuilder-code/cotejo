// Siembra ~20 cotejos de PRUEBA en value_events (packet, Test #12: "20
// cotejos de prueba sembrados → tasa de cambio de acción calculada y
// renderizada"). Datos sintéticos, generados con una semilla fija — no
// vienen de cotejos reales de ningún usuario. Usa la service role key
// (bypassa RLS a propósito, igual que guardarEventoValor.ts).
//
// Uso: SUPABASE_SERVICE_ROLE_KEY=... NEXT_PUBLIC_SUPABASE_URL=... node supabase/seed-value-events.mjs

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno.");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const ACCIONES = ["pague", "pedi_mas_evidencia", "pague_distinto", "no_pague"];
const DISPOSICIONES = ["gratis", "menos_de_50", "50_a_200", "mas_de_200", null];

// PRNG determinista (mulberry32) — mismos datos cada vez que se corre.
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260828);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];

const filas = Array.from({ length: 20 }, () => {
  const coincide = Math.floor(rand() * 4); // 0-3
  const contradice = rand() < 0.25 ? 1 : 0; // la mayoría no tiene contradicción real
  const sin_evidencia = 5 - coincide - contradice;
  return {
    monto_mxn: rand() < 0.7 ? Math.round((5000 + rand() * 250000) / 500) * 500 : null,
    tiempo_segundos: Math.round(30 + rand() * 240),
    n_evidencias: 2 + Math.floor(rand() * 3),
    distribucion: { coincide, contradice, sin_evidencia },
    accion: pick(ACCIONES),
    disposicion_pago: pick(DISPOSICIONES),
  };
});

const { data, error } = await supabase.from("value_events").insert(filas).select("id");
if (error) {
  console.error("Error sembrando:", error.message);
  process.exit(1);
}
console.log(`Sembradas ${data.length} filas de prueba en value_events.`);
