import { createBrowserClient } from "@supabase/ssr";

// Cliente para Client Components. Usa la anon key — es pública a propósito,
// la protege RLS (ver la migración en BUILD_PROMPT.md).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
