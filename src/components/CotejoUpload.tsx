"use client";

import { useRef, useState, useTransition } from "react";
import { leerEvidencias, type LeerEvidenciasResultado } from "@/app/actions/leerEvidencias";
import { MAX_EVIDENCIAS, TIPOS_PERMITIDOS } from "@/lib/validarEvidencias";
import { CAMPOS_ENTIDAD } from "@/lib/vision/entidades";
import { DocIcon } from "@/components/DocIcon";

const ETIQUETAS_CAMPO: Record<string, string> = {
  razon_social: "Razón social",
  nombre_persona_fisica: "Nombre (persona física)",
  rfc: "RFC",
  clabe: "CLABE",
  banco: "Banco",
  titular_cuenta: "Titular de la cuenta",
  domicilio: "Domicilio",
  telefono: "Teléfono",
  regimen_fiscal: "Régimen fiscal",
  folio: "Folio",
  monto: "Monto",
};

// Commit 4: subida real + validación real + LECTURA REAL con la API de
// Anthropic (un documento a la vez). Todavía NO existe el motor de cotejo
// que compara los campos entre documentos — eso es Commit 5. Por ahora
// esto muestra, honestamente, lo que el modelo extrajo de cada documento.
export function CotejoUpload() {
  const [archivos, setArchivos] = useState<File[]>([]);
  const [erroresCliente, setErroresCliente] = useState<string[]>([]);
  const [resultado, setResultado] = useState<LeerEvidenciasResultado | null>(null);
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
      const r = await leerEvidencias(formData);
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
        {enviando ? "Leyendo con IA…" : "Cotejar"}
      </button>
      {archivos.length < 2 && (
        <p className="text-center text-[10px] text-muted-2">Sube al menos 2 evidencias.</p>
      )}

      {resultado && !resultado.ok && (
        <ul className="flex flex-col gap-0.5 rounded-lg bg-red-50 px-2.5 py-2 text-[10px] text-red-700">
          {resultado.errores.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}

      {resultado && resultado.ok && (
        <div className="flex flex-col gap-2">
          <p className="text-[10px] text-muted-2">
            Lectura completada. El cotejo real (comparar estos campos entre documentos) llega en
            el próximo commit — esto es lo que el modelo extrajo de cada uno.
          </p>
          {resultado.documentos.map((doc) => {
            const camposConValor = CAMPOS_ENTIDAD.filter((c) => doc.entidades[c] !== null);
            return (
              <div
                key={doc.archivo}
                className={`flex flex-col gap-1 rounded-lg border px-2.5 py-2 text-[10.5px] ${
                  doc.entidades.posible_inyeccion
                    ? "border-amber-200 bg-amber-50"
                    : "border-border"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{doc.archivo}</span>
                  {doc.entidades.posible_inyeccion && (
                    <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-700">
                      Instrucción ignorada
                    </span>
                  )}
                </div>
                {doc.error && <span className="text-red-700">No se pudo leer: {doc.error}</span>}
                {!doc.error && camposConValor.length === 0 && (
                  <span className="italic text-muted-2">No se detectó ningún campo conocido.</span>
                )}
                {!doc.error &&
                  camposConValor.map((c) => (
                    <div key={c} className="flex justify-between gap-2 text-muted">
                      <span className="text-muted-2">{ETIQUETAS_CAMPO[c]}</span>
                      <span className="text-right">{doc.entidades[c]}</span>
                    </div>
                  ))}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
