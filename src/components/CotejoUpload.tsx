"use client";

import { useRef, useState, useTransition } from "react";
import { leerEvidencias, type LeerEvidenciasResultado } from "@/app/actions/leerEvidencias";
import { MAX_EVIDENCIAS, TIPOS_PERMITIDOS } from "@/lib/validarEvidencias";
import { cotejarDocumentos, CAMPOS_CANONICOS, type ResultadoCampo } from "@/lib/cotejo/cotejarDocumentos";
import { EstadoPill } from "@/components/EstadoPill";
import { DocIcon } from "@/components/DocIcon";

const ETIQUETAS_CAMPO: Record<string, string> = {
  razon_social: "Razón social",
  rfc: "RFC",
  titular_cuenta: "Titular de la cuenta",
  domicilio: "Domicilio",
  telefono: "Teléfono",
};

// El mismo ejemplo estático de docs/mockup.png — se muestra antes de que
// el usuario suba nada, con la misma forma (ResultadoCampo) que el motor
// de cotejo real, para que el cambio de "ejemplo" a "real" sea invisible.
const EJEMPLO: Record<string, ResultadoCampo> = {
  razon_social: {
    estado: "coincide",
    valores: [
      { fuente: "cotización", valor: "Tarimas del Bajío SA de CV" },
      { fuente: "constancia", valor: "Tarimas del Bajío SA de CV" },
    ],
  },
  rfc: { estado: "sin_evidencia", valores: [] },
  titular_cuenta: {
    estado: "contradice",
    valores: [
      { fuente: "cotización", valor: "Tarimas del Bajío SA de CV" },
      { fuente: "CLABE", valor: "Juan Carlos Ramírez López" },
    ],
  },
  domicilio: {
    estado: "coincide",
    valores: [
      { fuente: "cotización", valor: "Av. Insurgentes Sur 1234, CDMX" },
      { fuente: "constancia", valor: "Av. Insurgentes Sur 1234, CDMX" },
    ],
  },
  telefono: { estado: "sin_evidencia", valores: [] },
};

function FilaCampo({ campo, resultado }: { campo: string; resultado: ResultadoCampo }) {
  return (
    <div
      className={`flex flex-col gap-1 rounded-[9px] border px-2.5 py-2 ${
        resultado.estado === "contradice" ? "border-amber-200 bg-amber-50" : "border-border"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] font-semibold">{ETIQUETAS_CAMPO[campo]}</span>
        <EstadoPill estado={resultado.estado} />
      </div>

      {resultado.estado === "contradice" &&
        resultado.valores.map((v) => (
          <span key={v.fuente} className="text-[10.5px] text-amber-800">
            {v.fuente}: {v.valor}
          </span>
        ))}

      {resultado.estado === "coincide" && (
        <span className="text-[10.5px] text-muted">
          {resultado.valores[0].valor} — {resultado.valores.map((v) => v.fuente).join(", ")}
        </span>
      )}

      {resultado.estado === "sin_evidencia" && (
        <span className="text-[10.5px] italic text-muted-2">
          {resultado.valores.length === 0
            ? "No aparece en lo subido — no es una señal negativa"
            : `Solo aparece en "${resultado.valores[0].fuente}" — no es una señal negativa`}
        </span>
      )}
    </div>
  );
}

// Commit 5: flujo completo — sube, valida, lee con visión y COTEJA de
// verdad. Antes de subir nada muestra el ejemplo estático del mockup;
// en cuanto hay un resultado real de leerEvidencias, lo reemplaza con la
// comparación real de cotejarDocumentos().
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

  const resultadoCotejo =
    resultado && resultado.ok
      ? cotejarDocumentos(
          resultado.documentos.map((d) => ({
            fuente: d.archivo,
            campos: Object.fromEntries(CAMPOS_CANONICOS.map((c) => [c, d.entidades[c]])),
          })),
        )
      : null;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
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
      </div>

      <section className="flex flex-col gap-1.5">
        <h2 className="text-[10.5px] font-bold uppercase tracking-wide text-muted-2">
          {resultadoCotejo ? "Resultado del cotejo" : "Vista previa · EJEMPLO"}
        </h2>
        {CAMPOS_CANONICOS.map((campo) => (
          <FilaCampo key={campo} campo={campo} resultado={(resultadoCotejo ?? EJEMPLO)[campo]} />
        ))}
      </section>
    </section>
  );
}
