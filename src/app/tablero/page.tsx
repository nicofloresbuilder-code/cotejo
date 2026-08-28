import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic"; // siempre datos frescos, nunca cacheado

type ValueEvent = {
  monto_mxn: number | null;
  tiempo_segundos: number;
  distribucion: { coincide: number; contradice: number; sin_evidencia: number };
  accion: string;
  disposicion_pago: string | null;
};

type DeliveryModel = {
  id: string;
  nombre: string;
  descripcion: string;
  condicion_viabilidad: string;
  metrica_que_lo_sostiene: string;
};

const ETIQUETA_DISPOSICION: Record<string, string> = {
  gratis: "Nada",
  menos_de_50: "< $50",
  "50_a_200": "$50–200",
  mas_de_200: "> $200",
};

function formatoMxn(n: number): string {
  return n.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
}

// Commit 7: ya no hay ni un número hardcodeado — todo sale de value_events y
// delivery_models (RLS los deja de lectura pública, ver
// supabase/migrations/0001_init.sql). Sin sesión funciona igual: el
// tablero es público a propósito.
export default async function TableroPage() {
  const supabase = await createClient();

  const [{ data: eventosRaw }, { data: modelosRaw }] = await Promise.all([
    supabase
      .from("value_events")
      .select("monto_mxn, tiempo_segundos, distribucion, accion, disposicion_pago"),
    supabase.from("delivery_models").select("*").order("id"),
  ]);

  const eventos = (eventosRaw ?? []) as ValueEvent[];
  const modelos = (modelosRaw ?? []) as DeliveryModel[];
  const n = eventos.length;

  const montosDeclarados = eventos.filter((e) => e.monto_mxn !== null).map((e) => e.monto_mxn as number);
  const montoTotal = montosDeclarados.reduce((s, m) => s + m, 0);
  const tiempoPromedio = n ? Math.round(eventos.reduce((s, e) => s + e.tiempo_segundos, 0) / n) : 0;
  const cambiaronAccion = eventos.filter((e) => e.accion !== "pague").length;
  const tasaCambio = n ? Math.round((100 * cambiaronAccion) / n) : 0;

  const distTotal = eventos.reduce(
    (acc, e) => ({
      coincide: acc.coincide + e.distribucion.coincide,
      contradice: acc.contradice + e.distribucion.contradice,
      sin_evidencia: acc.sin_evidencia + e.distribucion.sin_evidencia,
    }),
    { coincide: 0, contradice: 0, sin_evidencia: 0 },
  );
  const camposTotal = distTotal.coincide + distTotal.contradice + distTotal.sin_evidencia;
  const distribucion = [
    { label: "Coincide", pct: camposTotal ? Math.round((100 * distTotal.coincide) / camposTotal) : 0, color: "bg-emerald-300" },
    { label: "Contradice", pct: camposTotal ? Math.round((100 * distTotal.contradice) / camposTotal) : 0, color: "bg-amber-400" },
    { label: "Sin evid.", pct: camposTotal ? Math.round((100 * distTotal.sin_evidencia) / camposTotal) : 0, color: "bg-gray-300" },
  ];

  const disposicionCounts: Record<string, number> = { gratis: 0, menos_de_50: 0, "50_a_200": 0, mas_de_200: 0 };
  for (const e of eventos) if (e.disposicion_pago) disposicionCounts[e.disposicion_pago]++;
  const disposicionesDeclaradas = Object.values(disposicionCounts).reduce((s, c) => s + c, 0);

  return (
    <main className="mx-auto flex w-full max-w-[420px] flex-1 flex-col">
      <header className="flex flex-col gap-1 border-b border-border px-5 pb-3 pt-5">
        <div className="flex items-center justify-between">
          <h1 className="text-[19px] font-bold tracking-tight text-accent">Tablero de valor</h1>
          {n === 0 && (
            <span className="rounded border border-border px-1.5 py-0.5 text-[9.5px] font-bold tracking-wide text-muted-2">
              SIN DATOS
            </span>
          )}
        </div>
        <p className="text-[12.5px] text-muted">
          {n} {n === 1 ? "cotejo registrado" : "cotejos registrados"}
        </p>
      </header>

      {n === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-5 text-center">
          <p className="text-[12.5px] text-muted">
            Todavía no hay cotejos registrados. Ve a{" "}
            <Link href="/" className="font-semibold text-accent underline underline-offset-2">
              Cotejo
            </Link>{" "}
            y haz el primero.
          </p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-6 px-5 py-4.5">
          <section className="grid grid-cols-3 gap-2">
            <div className="flex flex-col gap-1 rounded-[10px] border border-border p-2.5">
              <span className="text-[9px] font-semibold leading-tight text-muted">
                Monto en riesgo (acum.)
              </span>
              <span className="text-[15px] font-bold text-accent">{formatoMxn(montoTotal)}</span>
            </div>
            <div className="flex flex-col gap-1 rounded-[10px] border border-border p-2.5">
              <span className="text-[9px] font-semibold leading-tight text-muted">Tiempo por cotejo</span>
              <span className="text-[16px] font-bold text-accent">{tiempoPromedio}s</span>
            </div>
            <div className="flex flex-col gap-1 rounded-[10px] border border-border p-2.5">
              <span className="text-[9px] font-semibold leading-tight text-muted">Cambió la acción</span>
              <span className="text-[16px] font-bold text-accent">{tasaCambio}%</span>
            </div>
          </section>

          <section className="flex flex-col gap-2.5">
            <h2 className="text-[10.5px] font-bold uppercase tracking-wide text-muted-2">
              Distribución de resultados ({camposTotal} campos cotejados)
            </h2>
            <div className="flex h-28 items-end justify-center gap-6 border-b border-border">
              {distribucion.map((d) => (
                <div key={d.label} className="flex flex-col items-center gap-1.5">
                  <span className="text-[11px] font-bold">{d.pct}%</span>
                  <div className={`w-[42px] rounded-t-md ${d.color}`} style={{ height: `${Math.max(d.pct * 1.2, 2)}px` }} />
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-6">
              {distribucion.map((d) => (
                <span key={d.label} className="w-[42px] text-center text-[9px] font-semibold text-muted">
                  {d.label}
                </span>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-[10.5px] font-bold uppercase tracking-wide text-muted-2">
              Disposición a pagar declarada
            </h2>
            {disposicionesDeclaradas === 0 ? (
              <p className="text-[10.5px] italic text-muted-2">Nadie ha contestado todavía.</p>
            ) : (
              <div className="flex flex-col gap-1">
                {Object.entries(disposicionCounts).map(([k, count]) => (
                  <div key={k} className="flex items-center justify-between text-[11px] text-muted">
                    <span>{ETIQUETA_DISPOSICION[k]}</span>
                    <span className="font-semibold">
                      {count} ({disposicionesDeclaradas ? Math.round((100 * count) / disposicionesDeclaradas) : 0}%)
                    </span>
                  </div>
                ))}
              </div>
            )}
            <p className="text-[9px] italic text-muted-2">
              Costo variable real por cotejo: pendiente de activar (falta correr una migración).
            </p>
          </section>

          <section className="flex flex-col gap-1.5">
            <h2 className="text-[10.5px] font-bold uppercase tracking-wide text-muted-2">Modelo de entrega</h2>
            {modelos.map((m) => (
              <div key={m.id} className="flex flex-col gap-1 rounded-[9px] border border-border px-3 py-2.5">
                <span className="text-[12px] font-semibold">{m.nombre}</span>
                <span className="text-[10px] text-muted">{m.descripcion}</span>
                <span className="text-[9.5px] text-muted-2">
                  <strong className="text-muted">Viable si:</strong> {m.condicion_viabilidad}
                </span>
              </div>
            ))}
          </section>
        </div>
      )}

      <div className="px-5 pb-6">
        <Link href="/" className="text-[11px] font-semibold text-accent underline underline-offset-2">
          ← Volver a Cotejo
        </Link>
      </div>
    </main>
  );
}
