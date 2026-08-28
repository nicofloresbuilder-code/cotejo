import Link from "next/link";
import { EstadoPill } from "@/components/EstadoPill";
import { CardIcon, DocIcon, PersonIcon } from "@/components/DocIcon";

// Commit 1: layout estático que replica docs/mockup.png, sin lógica todavía.
// Los datos de abajo son de EJEMPLO — Commits 3-6 los reemplazan por
// subida real + visión + el motor de cotejo (ver BUILD_PROMPT.md).

const evidencias = [
  { label: "Cotización", Icon: DocIcon },
  { label: "Constancia", Icon: DocIcon },
  { label: "Perfil", Icon: PersonIcon },
  { label: "CLABE", Icon: CardIcon },
];

const campos = [
  {
    nombre: "Razón social",
    estado: "coincide" as const,
    detalle: "Tarimas del Bajío SA de CV — cotización y constancia",
  },
  {
    nombre: "RFC",
    estado: "sin_evidencia" as const,
    detalle: "No aparece en lo subido — no es una señal negativa",
  },
  {
    nombre: "Titular de la cuenta",
    estado: "contradice" as const,
    valores: [
      "Cotización: Tarimas del Bajío SA de CV",
      "CLABE: Juan Carlos Ramírez López",
    ],
  },
  {
    nombre: "Domicilio",
    estado: "coincide" as const,
    detalle: "Av. Insurgentes Sur 1234, CDMX",
  },
  {
    nombre: "Teléfono",
    estado: "sin_evidencia" as const,
    detalle: "No aparece en lo subido — no es una señal negativa",
  },
];

export default function CotejoPage() {
  return (
    <main className="mx-auto flex w-full max-w-[420px] flex-1 flex-col">
      <header className="flex flex-col gap-1 border-b border-border px-5 pb-3 pt-5">
        <div className="flex items-center justify-between">
          <h1 className="text-[19px] font-bold tracking-tight text-accent">Cotejo</h1>
          <span className="rounded border border-border px-1.5 py-0.5 text-[9.5px] font-bold tracking-wide text-muted-2">
            EJEMPLO
          </span>
        </div>
        <p className="text-[12.5px] text-muted">Compara la evidencia antes de pagar</p>
      </header>

      <div className="flex flex-1 flex-col gap-4 px-5 pt-3.5">
        <section className="flex flex-col gap-1.5">
          <h2 className="text-[10.5px] font-bold uppercase tracking-wide text-muted-2">
            4 evidencias subidas
          </h2>
          <div className="grid grid-cols-4 gap-1.5">
            {evidencias.map(({ label, Icon }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-border bg-gray-50">
                  <Icon />
                </div>
                <span className="text-center text-[9px] font-semibold text-muted">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-1.5">
          {campos.map((campo) => (
            <div
              key={campo.nombre}
              className={`flex flex-col gap-1 rounded-[9px] border px-2.5 py-2 ${
                campo.estado === "contradice"
                  ? "border-amber-200 bg-amber-50"
                  : "border-border"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[12px] font-semibold">{campo.nombre}</span>
                <EstadoPill estado={campo.estado} />
              </div>
              {campo.valores ? (
                campo.valores.map((v) => (
                  <span key={v} className="text-[10.5px] text-amber-800">
                    {v}
                  </span>
                ))
              ) : (
                <span
                  className={`text-[10.5px] ${
                    campo.estado === "sin_evidencia" ? "italic text-muted-2" : "text-muted"
                  }`}
                >
                  {campo.detalle}
                </span>
              )}
            </div>
          ))}
        </section>
      </div>

      <div className="flex flex-col gap-2 border-t border-border px-5 pb-6 pt-3">
        <div className="flex flex-col gap-1.5 rounded-[10px] border border-border bg-gray-50 p-3">
          <h3 className="text-[12.5px] font-bold">Pídele esto</h3>
          <p className="text-[10.5px] leading-snug text-muted">
            &ldquo;Antes de pasar el anticipo, ¿me confirmas el RFC y el teléfono a los que sale la
            factura? Solo para tener todo parejo de mi lado.&rdquo;
          </p>
          <button
            type="button"
            className="mt-0.5 rounded-lg bg-accent px-3.5 py-2.5 text-[12.5px] font-semibold text-white"
          >
            Copiar para WhatsApp
          </button>
        </div>
        <div className="rounded-lg bg-gray-100 px-2.5 py-2">
          <p className="text-[9.5px] leading-snug text-muted">
            No verificamos contra el SAT ni contra ningún banco. Comparamos solo lo que subiste.
          </p>
        </div>
        <Link
          href="/tablero"
          className="mt-1 text-center text-[11px] font-semibold text-accent underline underline-offset-2"
        >
          Ver el tablero de valor →
        </Link>
      </div>
    </main>
  );
}
