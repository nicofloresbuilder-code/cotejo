import Link from "next/link";
import { AuthButton } from "@/components/AuthButton";
import { CotejoUpload } from "@/components/CotejoUpload";

// La herramienta en sí. La explicación de qué es Cotejo y para qué sirve
// vive en la página de inicio (src/app/page.tsx) — aquí el usuario ya
// llegó sabiendo qué va a hacer.

export default function CotejarPage() {
  return (
    <main className="mx-auto flex w-full max-w-[420px] flex-1 flex-col">
      <header className="flex flex-col gap-1 border-b border-border px-5 pb-3 pt-5">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-[19px] font-bold tracking-tight text-accent">
            Cotejo
          </Link>
          <Link
            href="/"
            className="text-[10.5px] font-semibold text-muted-2 underline underline-offset-2"
          >
            ¿Qué es esto?
          </Link>
        </div>
        <p className="text-[12.5px] text-muted">Compara la evidencia antes de pagar</p>
      </header>

      <div className="flex flex-1 flex-col gap-4 px-5 pt-3.5">
        <CotejoUpload />
      </div>

      <div className="flex flex-col gap-2 border-t border-border px-5 pb-6 pt-3">
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
