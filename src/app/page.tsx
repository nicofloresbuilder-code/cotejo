import Link from "next/link";
import { AuthButton } from "@/components/AuthButton";
import { CotejoUpload } from "@/components/CotejoUpload";

// Commit 5: <CotejoUpload /> ahora hace el flujo completo — sube, valida,
// lee con visión y coteja de verdad (cotejarDocumentos). Antes de subir
// nada, muestra el mismo ejemplo estático de docs/mockup.png a modo de
// vista previa; en cuanto hay un resultado real, lo reemplaza.

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
        <CotejoUpload />
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
        <div className="mt-1 flex flex-col items-center gap-1.5">
          <Link
            href="/tablero"
            className="text-[11px] font-semibold text-accent underline underline-offset-2"
          >
            Ver el tablero de valor →
          </Link>
          <AuthButton />
        </div>
      </div>
    </main>
  );
}
