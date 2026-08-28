import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <main className="mx-auto flex w-full max-w-[420px] flex-1 flex-col items-center justify-center gap-2 px-5 text-center">
      <h1 className="text-[16px] font-bold">No se pudo iniciar sesión</h1>
      <p className="text-[12.5px] text-muted">
        Algo falló al conectar con Google. Puedes seguir usando Cotejo sin cuenta — el login
        solo hace falta para guardar un cotejo.
      </p>
      <Link href="/" className="text-[12px] font-semibold text-accent underline underline-offset-2">
        Volver a Cotejo
      </Link>
    </main>
  );
}
