"use client";

import { useRef, useState, useTransition } from "react";
import { subirEvidencias, type SubirEvidenciasResultado } from "@/app/actions/subirEvidencias";
import { MAX_EVIDENCIAS, TIPOS_PERMITIDOS } from "@/lib/validarEvidencias";
import { DocIcon } from "@/components/DocIcon";

// Commit 3: subida real + validación real (cliente y servidor). Todavía NO
// hay visión ni cotejo — eso es Commit 4/5. El resultado de este componente
// es intencionalmente honesto sobre eso, en vez de fingir un cotejo real.
export function CotejoUpload() {
  const [archivos, setArchivos] = useState<File[]>([]);
  const [erroresCliente, setErroresCliente] = useState<string[]>([]);
  const [resultado, setResultado] = useState<SubirEvidenciasResultado | null>(null);
  const [enviando, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function agregarArchivos(nuevos: FileList | null) {
    if (!nuevos) return;
    setResultado(null);
    const cupo = MAX_EVIDENCIAS - archivos.length;
    const elegidos = Array.from(nuevos).slice(0, cupo);

    const errores: string[] = [];
    for (const f of elegidos) {
      if (!TIPOS_PERMITIDOS.includes(f.type as (typeof TIPOS_PERMITIDOS)[number])) {
        errores.push(`"${f.name}" no es JPG, PNG o PDF.`);
      } else if (f.size > 5 * 1024 * 1024) {
        errores.push(`"${f.name}" pesa más de 5MB.`);
      }
    }
    setErroresCliente(errores);
    setArchivos((prev) => [...prev, ...elegidos]);
    if (inputRef.current) inputRef.current.value = "";
  }

  function quitarArchivo(i: number) {
    setResultado(null);
    setArchivos((prev) => prev.filter((_, idx) => idx !== i));
  }

  function cotejar() {
    const formData = new FormData();
    archivos.forEach((f) => formData.append("evidencias", f));
    startTransition(async () => {
      const r = await subirEvidencias(formData);
      setResultado(r);
    });
  }

  const slots = Array.from({ length: MAX_EVIDENCIAS }, (_, i) => archivos[i] ?? null);
  const puedeCotejar = archivos.length >= 2 && archivos.length <= MAX_EVIDENCIAS && !enviando;

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-[10.5px] font-bold uppercase tracking-wide text-muted-2">
        {archivos.length} de {MAX_EVIDENCIAS} evidencias
      </h2>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={TIPOS_PERMITIDOS.join(",")}
        className="hidden"
        onChange={(e) => agregarArchivos(e.target.files)}
      />

      <div className="grid grid-cols-4 gap-1.5">
        {slots.map((archivo, i) =>
          archivo ? (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="relative flex aspect-square w-full items-center justify-center rounded-lg border border-border bg-gray-50">
                <DocIcon />
                <button
                  type="button"
                  aria-label={`Quitar ${archivo.name}`}
                  onClick={() => quitarArchivo(i)}
                  className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white"
                >
                  ×
                </button>
              </div>
              <span className="max-w-full truncate text-center text-[9px] font-semibold text-muted">
                {archivo.name}
              </span>
            </div>
          ) : (
            <button
              key={i}
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex aspect-square w-full flex-col items-center justify-center gap-0.5 rounded-lg border border-dashed border-border bg-white text-muted-2"
            >
              <span className="text-[18px] leading-none">+</span>
              <span className="text-[8px] font-semibold">Agregar</span>
            </button>
          ),
        )}
      </div>

      {erroresCliente.length > 0 && (
        <ul className="flex flex-col gap-0.5 rounded-lg bg-red-50 px-2.5 py-2 text-[10px] text-red-700">
          {erroresCliente.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}

      <button
        type="button"
        disabled={!puedeCotejar}
        onClick={cotejar}
        className="rounded-lg bg-accent px-3.5 py-2.5 text-[12.5px] font-semibold text-white disabled:opacity-40"
      >
        {enviando ? "Validando…" : "Cotejar"}
      </button>
      {archivos.length < 2 && (
        <p className="text-center text-[10px] text-muted-2">Sube al menos 2 evidencias.</p>
      )}

      {resultado && resultado.ok && (
        <div className="flex flex-col gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-[10.5px] text-emerald-800">
          <span className="font-semibold">✓ {resultado.archivos.length} evidencias válidas.</span>
          <span className="text-emerald-700">
            La lectura con IA y la tabla de cotejo real llegan en el próximo commit.
          </span>
        </div>
      )}
      {resultado && !resultado.ok && (
        <ul className="flex flex-col gap-0.5 rounded-lg bg-red-50 px-2.5 py-2 text-[10px] text-red-700">
          {resultado.errores.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
