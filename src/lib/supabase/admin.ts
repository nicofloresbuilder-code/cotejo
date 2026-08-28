import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// SOLO para server actions que escriben en value_events (eventos anónimos
// del tablero de valor) — la service role key IGNORA RLS a propósito, así
// que este cliente nunca se expone al browser. `import "server-only"` hace
// que el build truene si algo intenta meterlo en un bundle de cliente.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
