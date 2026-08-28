"use client";

import { useRef, useState, useTransition } from "react";
import { leerEvidencias, type LeerEvidenciasResultado } from "@/app/actions/leerEvidencias";
import { guardarEventoValor } from "@/app/actions/guardarEventoValor";
import { guardarCheck } from "@/app/actions/guardarCheck";
import { ACCIONES, DISPOSICIONES_PAGO, type Accion, type DisposicionPago } from "@/lib/eventoValor";
import { MAX_EVIDENCIAS, TIPOS_PERMITIDOS } from "@/lib/validarEvidencias";
import { cotejarDocumentos, CAMPOS_CANONICOS, type ResultadoCampo } from "@/lib/cotejo/cotejarDocumentos";
import { generarMensajeWhatsApp } from "@/lib/mensajes/generarMensajeWhatsApp";
import { useAuthUser } from "@/hooks/useAuthUser";
import { EstadoPill } from "@/components/EstadoPill";
import { DocIcon } from "@/components/DocIcon";

const ETIQUETAS_CAMPO: Record<string, string> = {
  razon_social: "Razón social",
  rfc: "RFC",
  titular_cuenta: "Titular de la cuenta",
  domicilio: "Domicilio",
  telefono: "Teléfono",
};

const ETIQUETA_ACCION: Record<Accion, string> = {
  pague: "Pagué",
  pedi_mas_evidencia: "Pedí más evidencia",
  pague_distinto: "Pagué, pero algo cambió",
  no_pague: "No pagué",
};

const ETIQUETA_DISPOSICION: Record<DisposicionPago, string> = {
  gratis: "Nada, debería ser gratis",
  menos_de_50: "Menos de $50 MXN",
  "50_a_200": "Entre $50 y $200 MXN",
  mas_de_200: "Más de $200 MXN",
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

const MENSAJE_EJEMPLO =
  '"Antes de pasar el anticipo, ¿me confirmas el RFC y el teléfono a los que sale la factura? Solo para tener todo parejo de mi lado."';

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

// Commit 6: flujo completo de principio a fin — sube, valida, lee con
// visión, coteja, genera el mensaje para pedir lo que falta, y deja que
// el usuario declare qué hizo después. Esa declaración (+ tiempo real,
// distribución de estados, disposición a pagar) es el dato que alimenta
// el tablero de valor — anónimo, sin nada de la contraparte.
export function CotejoUpload() {
  const [archivos, setArchivos] = useState<File[]>([]);
  const [erroresCliente, setErroresCliente] = useState<string[]>([]);
  const [resultado, setResultado] = useState<LeerEvidenciasResultado | null>(null);
  const [montoInput, setMontoInput] = useState("");
  const [enviando, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const inicioRef = useRef<number | null>(null);

  const [copiado, setCopiado] = useState(false);
  const [accionSeleccionada, setAccionSeleccionada] = useState<Accion | null>(null);
  const [eventoGuardado, setEventoGuardado] = useState(false);
  const [errorEvento, setErrorEvento] = useState<string | null>(null);
  const [guardandoEvento, startTransitionEvento] = useTransition();

  const { user } = useAuthUser();
  const [checkGuardado, setCheckGuardado] = useState(false);
  const [errorCheck, setErrorCheck] = useState<string | null>(null);
  const [guardandoCheck, startTransitionCheck] = useTransition();

  function reiniciarDeclaracion() {
    setAccionSeleccionada(null);
    setEventoGuardado(false);
    setCheckGuardado(false);
    setErrorCheck(null);
    setErrorEvento(null);
  }

  function agregarArchivos(nuevos: FileList | null) {
    if (!nuevos) return;
    setResultado(null);
    reiniciarDeclaracion();
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
    reiniciarDeclaracion();
    setArchivos((prev) => prev.filter((_, idx) => idx !== i));
  }

  function cotejar() {
    if (inicioRef.current === null) inicioRef.current = Date.now();
    reiniciarDeclaracion();
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

  const mensaje = resultadoCotejo ? generarMensajeWhatsApp(resultadoCotejo) : MENSAJE_EJEMPLO;

  async function copiarMensaje() {
    if (!mensaje) return;
    try {
      await navigator.clipboard.writeText(mensaje);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Portapapeles bloqueado (permiso del navegador) — el texto sigue
      // visible en pantalla para copiar a mano.
    }
  }

  function elegirDisposicion(disposicion: DisposicionPago) {
    if (!resultadoCotejo || !accionSeleccionada) return;

    const distribucion = { coincide: 0, contradice: 0, sin_evidencia: 0 };
    for (const campo of CAMPOS_CANONICOS) distribucion[resultadoCotejo[campo].estado]++;

    startTransitionEvento(async () => {
      // Date.now() vive aquí adentro (no antes de startTransition) para
      // que quede claramente fuera de cualquier ruta de render.
      const tiempoSegundos = inicioRef.current
        ? Math.round((Date.now() - inicioRef.current) / 1000)
        : 0;
      const montoMxn =
        montoInput.trim() !== "" && !Number.isNaN(Number(montoInput)) ? Number(montoInput) : null;

      const r = await guardarEventoValor({
        montoMxn,
        tiempoSegundos,
        nEvidencias: archivos.length,
        distribucion,
        accion: accionSeleccionada,
        disposicionPago: disposicion,
      });
      if (r.ok) {
        setEventoGuardado(true);
      } else {
        setErrorEvento(r.error ?? "No se pudo guardar el evento.");
      }
    });
  }

  function guardarCotejo() {
    if (!resultadoCotejo) return;
    startTransitionCheck(async () => {
      const r = await guardarCheck(resultadoCotejo, archivos.length);
      if (r.ok) {
        setCheckGuardado(true);
      } else {
        setErrorCheck(r.error ?? "No se pudo guardar.");
      }
    });
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-[10.5px] font-bold uppercase tracking-wide text-muted-2">
            Monto del anticipo (opcional)
          </span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            placeholder="$ MXN"
            value={montoInput}
            onChange={(e) => setMontoInput(e.target.value)}
            className="rounded-lg border border-border px-2.5 py-2 text-[12.5px] outline-none focus:border-accent"
          />
        </label>

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
        {resultado && resultado.ok && (
          <p className="text-[9.5px] text-muted-2">
            Esta lectura con IA costó ≈${resultado.costoVariableMxn.toFixed(3)} MXN (calculado del
            consumo real de tokens, no estimado).
          </p>
        )}
      </section>

      <div className="flex flex-col gap-1.5 rounded-[10px] border border-border bg-gray-50 p-3">
        <h3 className="text-[12.5px] font-bold">Pídele esto</h3>
        {mensaje ? (
          <>
            <p className="text-[10.5px] leading-snug text-muted">&ldquo;{mensaje}&rdquo;</p>
            <button
              type="button"
              onClick={copiarMensaje}
              disabled={!resultadoCotejo}
              className="mt-0.5 rounded-lg bg-accent px-3.5 py-2.5 text-[12.5px] font-semibold text-white disabled:opacity-40"
            >
              {copiado ? "Copiado ✓" : "Copiar para WhatsApp"}
            </button>
          </>
        ) : (
          <p className="text-[10.5px] leading-snug text-emerald-700">
            Todo coincide — no hace falta pedir nada más.
          </p>
        )}
      </div>

      {resultadoCotejo && !eventoGuardado && (
        <div className="flex flex-col gap-2 rounded-[10px] border border-border p-3">
          {!accionSeleccionada ? (
            <>
              <h3 className="text-[12.5px] font-bold">¿Qué hiciste?</h3>
              <div className="grid grid-cols-2 gap-1.5">
                {ACCIONES.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAccionSeleccionada(a)}
                    className="rounded-lg border border-border px-2 py-2 text-[11px] font-semibold text-muted hover:border-accent hover:text-accent"
                  >
                    {ETIQUETA_ACCION[a]}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <h3 className="text-[12.5px] font-bold">¿Cuánto pagarías por este cotejo?</h3>
              <div className="flex flex-col gap-1.5">
                {DISPOSICIONES_PAGO.map((d) => (
                  <button
                    key={d}
                    type="button"
                    disabled={guardandoEvento}
                    onClick={() => elegirDisposicion(d)}
                    className="rounded-lg border border-border px-2.5 py-2 text-left text-[11px] font-semibold text-muted hover:border-accent hover:text-accent disabled:opacity-40"
                  >
                    {ETIQUETA_DISPOSICION[d]}
                  </button>
                ))}
              </div>
              {guardandoEvento && <p className="text-[10px] text-muted-2">Guardando…</p>}
              {errorEvento && <p className="text-[10px] text-red-700">{errorEvento}</p>}
            </>
          )}
        </div>
      )}

      {eventoGuardado && (
        <div className="flex flex-col gap-2 rounded-[10px] border border-emerald-200 bg-emerald-50 p-3 text-[11px] text-emerald-800">
          <p>Gracias — esto alimenta el tablero de valor, sin ningún dato de la contraparte.</p>
          {user && !checkGuardado && (
            <button
              type="button"
              disabled={guardandoCheck}
              onClick={guardarCotejo}
              className="self-start rounded-lg border border-emerald-700 px-2.5 py-1.5 text-[10.5px] font-semibold text-emerald-800 disabled:opacity-40"
            >
              {guardandoCheck ? "Guardando…" : "Guardar este cotejo en mi cuenta"}
            </button>
          )}
          {checkGuardado && <p className="font-semibold">✓ Cotejo guardado en tu cuenta.</p>}
          {errorCheck && <p className="text-red-700">{errorCheck}</p>}
        </div>
      )}
    </section>
  );
}
