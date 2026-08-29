// Test #9 del packet: "usuario B pide un check de usuario A → cero
// filas." Prueba REAL con dos usuarios reales de Supabase Auth (creados
// y borrados por este script) — no una simulación de la policy, sino la
// policy corriendo de verdad contra Postgres con sesiones autenticadas
// reales. Necesario porque Google Sign-in todavía no está activado
// (no hay forma de loguearse en el navegador para probarlo a mano).
//
// Uso: NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_ANON_KEY=...
//      SUPABASE_SERVICE_ROLE_KEY=... node supabase/verificar-rls-checks.mjs

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !anon || !service) {
  console.error("Faltan variables de entorno.");
  process.exit(1);
}

const admin = createClient(url, service, { auth: { persistSession: false } });
const sufijo = Date.now();
const passwordA = "TestRls_" + sufijo + "_a!";
const passwordB = "TestRls_" + sufijo + "_b!";
const emailA = `test-rls-a-${sufijo}@example.com`;
const emailB = `test-rls-b-${sufijo}@example.com`;

let userAId, userBId;

try {
  console.log("Creando usuario A y B de prueba...");
  const { data: a, error: eA } = await admin.auth.admin.createUser({
    email: emailA,
    password: passwordA,
    email_confirm: true,
  });
  if (eA) throw eA;
  userAId = a.user.id;

  const { data: b, error: eB } = await admin.auth.admin.createUser({
    email: emailB,
    password: passwordB,
    email_confirm: true,
  });
  if (eB) throw eB;
  userBId = b.user.id;

  console.log("Iniciando sesión como A e insertando un check de prueba...");
  const clienteA = createClient(url, anon, { auth: { persistSession: false } });
  const { error: signInAErr } = await clienteA.auth.signInWithPassword({ email: emailA, password: passwordA });
  if (signInAErr) throw signInAErr;

  const { data: checkInsertado, error: insertErr } = await clienteA
    .from("checks")
    .insert({
      user_id: userAId,
      campos: { razon_social: { estado: "coincide", valores: [] } },
      n_evidencias: 2,
    })
    .select("id")
    .single();
  if (insertErr) throw insertErr;
  console.log("  check insertado por A:", checkInsertado.id);

  console.log("A puede leer su propio check?");
  const { data: propioA } = await clienteA.from("checks").select("id").eq("id", checkInsertado.id);
  console.log(`  -> ${propioA.length} fila(s) (esperado: 1)`);

  console.log("Iniciando sesión como B y pidiendo el check de A...");
  const clienteB = createClient(url, anon, { auth: { persistSession: false } });
  const { error: signInBErr } = await clienteB.auth.signInWithPassword({ email: emailB, password: passwordB });
  if (signInBErr) throw signInBErr;

  const { data: intentoB, error: selectBErr } = await clienteB
    .from("checks")
    .select("id")
    .eq("id", checkInsertado.id);
  if (selectBErr) throw selectBErr;
  console.log(`  -> B ve ${intentoB.length} fila(s) del check de A (esperado: 0)`);

  const resultado = propioA.length === 1 && intentoB.length === 0 ? "PASA" : "FALLA";
  console.log(`\nTest #9 (RLS checks, usuario B no ve los checks de A): ${resultado}`);

  console.log("\nLimpiando (borrando el check y los usuarios de prueba)...");
  await admin.from("checks").delete().eq("id", checkInsertado.id);
} finally {
  if (userAId) await admin.auth.admin.deleteUser(userAId);
  if (userBId) await admin.auth.admin.deleteUser(userBId);
  console.log("Usuarios de prueba borrados.");
}
