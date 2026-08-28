import Link from "next/link";

// Commit 1: layout estático que replica docs/mockup.png. Commit 7 lo
// conecta a agregados reales de value_events y delivery_models
// (ver BUILD_PROMPT.md) — estos números son de EJEMPLO.

const metricas = [
  { label: "Monto en riesgo", valor: "$1.84M" },
  { label: "Tiempo por cotejo", valor: "72 s" },
  { label: "Cambió la acción", valor: "38%" },
];

const distribucion = [
  { label: "Coincide", pct: 55, color: "bg-emerald-300" },
  { label: "Contradice", pct: 15, color: "bg-amber-400" },
  { label: "Sin evid.", pct: 30, color: "bg-gray-300" },
];

const modelos = [
  {
    nombre: "Producto",
    detalle: "App independiente",
    estado: "Sostenido por datos",
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    nombre: "Feature",
    detalle: "Dentro de un banco",
    estado: "Requiere alianza",
    color: "bg-amber-100 text-amber-700",
  },
  {
    nombre: "Infraestructura",
    detalle: "Sobre el riel de pagos",
    estado: "Fuera de alcance",
    color: "bg-gray-100 text-gray-600",
  },
];

export default function TableroPage() {
  return (
    <main className="mx-auto flex w-full max-w-[420px] flex-1 flex-col">
      <header className="flex flex-col gap-1 border-b border-border px-5 pb-3 pt-5">
        <div className="flex items-center justify-between">
          <h1 className="text-[19px] font-bold tracking-tight text-accent">Tablero de valor</h1>
          <span className="rounded border border-border px-1.5 py-0.5 text-[9.5px] font-bold tracking-wide text-muted-2">
            EJEMPLO
          </span>
        </div>
        <p className="text-[12.5px] text-muted">20 cotejos de prueba · datos de ejemplo</p>
      </header>

      <div className="flex flex-1 flex-col gap-6 px-5 py-4.5">
        <section className="grid grid-cols-3 gap-2">
          {metricas.map((m) => (
            <div key={m.label} className="flex flex-col gap-1 rounded-[10px] border border-border p-2.5">
              <span className="text-[9px] font-semibold leading-tight text-muted">{m.label}</span>
              <span className="text-[16px] font-bold text-accent">{m.valor}</span>
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-2.5">
          <h2 className="text-[10.5px] font-bold uppercase tracking-wide text-muted-2">
            Distribución de resultados
          </h2>
          <div className="flex h-28 items-end justify-center gap-6 border-b border-border">
            {distribucion.map((d) => (
              <div key={d.label} className="flex flex-col items-center gap-1.5">
                <span className="text-[11px] font-bold">{d.pct}%</span>
                <div
                  className={`w-[42px] rounded-t-md ${d.color}`}
                  style={{ height: `${d.pct * 1.2}px` }}
                />
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

        <section className="flex flex-col gap-1.5">
          <h2 className="text-[10.5px] font-bold uppercase tracking-wide text-muted-2">
            Modelo de entrega
          </h2>
          {modelos.map((m) => (
            <div
              key={m.nombre}
              className="flex items-center justify-between gap-2 rounded-[9px] border border-border px-3 py-2.5"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[12px] font-semibold">{m.nombre}</span>
                <span className="text-[9.5px] text-muted-2">{m.detalle}</span>
              </div>
              <span className={`shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[9.5px] font-bold ${m.color}`}>
                {m.estado}
              </span>
            </div>
          ))}
        </section>
      </div>

      <div className="px-5 pb-6">
        <Link
          href="/"
          className="text-[11px] font-semibold text-accent underline underline-offset-2"
        >
          ← Volver a Cotejo
        </Link>
      </div>
    </main>
  );
}
