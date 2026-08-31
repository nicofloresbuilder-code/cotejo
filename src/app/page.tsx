import Link from "next/link";
import { EstadoPill } from "@/components/EstadoPill";

// Página de inicio. Existe porque la herramienta sola no se explica: quien
// llega por primera vez veía una pantalla de subir archivos sin saber qué
// hace ni para qué. Aquí se explica el momento de uso, qué compara, qué
// significan los tres resultados, y —explícitamente— qué NO hace
// (Condición 5 del packet). Sin lenguaje de veredicto ni de confiabilidad
// en ningún punto (Condiciones 1 y 4).

const PASOS = [
  {
    n: "1",
    titulo: "Subes lo que ya tienes",
    texto:
      "De 2 a 4 cosas que ya están en tu WhatsApp: la cotización, la constancia de situación fiscal, la captura del perfil, el mensaje con la CLABE.",
  },
  {
    n: "2",
    titulo: "Cotejo los compara entre sí",
    texto:
      "Lee cada documento por separado y compara los datos campo por campo: razón social, RFC, titular de la cuenta, domicilio y teléfono.",
  },
  {
    n: "3",
    titulo: "Te dice qué cuadra y qué no",
    texto:
      "Ves cuáles datos aparecen igual en dos documentos, cuáles aparecen distintos, y cuáles no aparecen. Más un mensaje listo para copiar y pedir lo que falta.",
  },
];

export default function InicioPage() {
  return (
    <main className="mx-auto flex w-full max-w-[420px] flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-border px-5 pb-3 pt-5">
        <span className="text-[19px] font-bold tracking-tight text-accent">Cotejo</span>
        <Link
          href="/tablero"
          className="text-[10.5px] font-semibold text-muted-2 underline underline-offset-2"
        >
          Tablero de valor
        </Link>
      </header>

      {/* Hero */}
      <section className="flex flex-col gap-3 px-5 pb-7 pt-8">
        <h1 className="text-[26px] font-bold leading-[1.15] tracking-tight text-ink">
          Antes de mandar el anticipo, revisa que los datos cuadren.
        </h1>
        <p className="text-[14px] leading-relaxed text-muted">
          Cotejo compara entre sí los documentos que el proveedor ya te mandó por WhatsApp y te
          muestra, dato por dato, cuáles coinciden y cuáles no. En menos de dos minutos, sin crear
          cuenta.
        </p>
        <Link
          href="/cotejar"
          className="mt-1 rounded-lg bg-accent px-4 py-3.5 text-center text-[14px] font-semibold text-white"
        >
          Cotejar mis documentos
        </Link>
        <p className="text-center text-[11px] text-muted-2">Gratis · Sin registro · Español</p>
      </section>

      {/* El momento */}
      <section className="flex flex-col gap-3 border-t border-border bg-gray-50 px-5 py-7">
        <h2 className="text-[10.5px] font-bold uppercase tracking-wide text-muted-2">
          Para este momento exacto
        </h2>
        <p className="text-[13.5px] leading-relaxed text-ink">
          Conseguiste un proveedor nuevo por recomendación. Te manda la cotización por foto, luego
          una CLABE en un mensaje, y te pide el anticipo <strong>hoy</strong>.
        </p>
        <p className="text-[13.5px] leading-relaxed text-ink">
          Tienes todo en el celular, regado en la conversación. Y una vez que sale el SPEI,{" "}
          <strong>no hay forma de regresarlo</strong>.
        </p>
        <p className="text-[13.5px] leading-relaxed text-muted">
          Casi nunca hace falta un documento falsificado con maestría para que algo salga mal. Basta
          con que la cotización venga a nombre de una empresa y la CLABE esté a nombre de otra
          persona — y que nadie haya tenido tiempo de notarlo.
        </p>
      </section>

      {/* Cómo funciona */}
      <section className="flex flex-col gap-4 border-t border-border px-5 py-7">
        <h2 className="text-[10.5px] font-bold uppercase tracking-wide text-muted-2">
          Cómo funciona
        </h2>
        {PASOS.map((paso) => (
          <div key={paso.n} className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-[12px] font-bold text-white">
              {paso.n}
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-[13.5px] font-semibold text-ink">{paso.titulo}</h3>
              <p className="text-[12.5px] leading-relaxed text-muted">{paso.texto}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Los tres resultados */}
      <section className="flex flex-col gap-3 border-t border-border bg-gray-50 px-5 py-7">
        <h2 className="text-[10.5px] font-bold uppercase tracking-wide text-muted-2">
          Los tres resultados posibles
        </h2>
        <p className="text-[12.5px] leading-relaxed text-muted">
          Cada dato cae en uno de tres estados. Nunca se suman en una calificación general — la
          decisión sigue siendo tuya, con la información a la vista.
        </p>

        <div className="flex flex-col gap-2">
          <div className="flex flex-col items-start gap-1.5 rounded-[9px] border border-border bg-white px-3 py-2.5">
            <EstadoPill estado="coincide" />
            <p className="text-[12px] leading-relaxed text-muted">
              El mismo dato aparece igual en dos o más de tus documentos. Te decimos en cuáles.
            </p>
          </div>

          <div className="flex flex-col items-start gap-1.5 rounded-[9px] border border-amber-200 bg-amber-50 px-3 py-2.5">
            <EstadoPill estado="contradice" />
            <p className="text-[12px] leading-relaxed text-amber-900">
              Dos de tus documentos dicen cosas distintas sobre lo mismo. Te mostramos ambos valores
              tal cual, para que tú veas la diferencia y preguntes.
            </p>
          </div>

          <div className="flex flex-col items-start gap-1.5 rounded-[9px] border border-border bg-white px-3 py-2.5">
            <EstadoPill estado="sin_evidencia" />
            <p className="text-[12px] leading-relaxed text-muted">
              Ese dato no aparece en lo que subiste, o aparece en un solo documento y no hay con qué
              compararlo. <strong className="text-ink">Esto no es una señal negativa</strong> — es
              normal con proveedores que cotizan por WhatsApp o no manejan factura. Solo significa
              que hace falta pedirlo.
            </p>
          </div>
        </div>
      </section>

      {/* Qué NO hace */}
      <section className="flex flex-col gap-3 border-t border-border px-5 py-7">
        <h2 className="text-[10.5px] font-bold uppercase tracking-wide text-muted-2">
          Qué no hace Cotejo
        </h2>
        <ul className="flex flex-col gap-2.5">
          <li className="text-[12.5px] leading-relaxed text-muted">
            <strong className="text-ink">No consulta al SAT, ni a tu banco, ni a ningún
            registro.</strong>{" "}
            Compara únicamente los documentos que tú subes, entre ellos. Nada más.
          </li>
          <li className="text-[12.5px] leading-relaxed text-muted">
            <strong className="text-ink">No califica a tu proveedor.</strong> No hay puntaje, ni
            calificación, ni una etiqueta que diga si alguien es bueno o malo. Eso lo decides tú.
          </li>
          <li className="text-[12.5px] leading-relaxed text-muted">
            <strong className="text-ink">No guarda tus documentos.</strong> Las imágenes se procesan
            y se descartan en el momento; nunca se almacenan. Traen datos de un tercero que no
            consintió nada.
          </li>
          <li className="text-[12.5px] leading-relaxed text-muted">
            <strong className="text-ink">No mueve tu dinero.</strong> El pago lo haces tú, en tu
            banco, como siempre.
          </li>
        </ul>
      </section>

      {/* CTA final */}
      <section className="flex flex-col gap-3 border-t border-border px-5 pb-8 pt-7">
        <Link
          href="/cotejar"
          className="rounded-lg bg-accent px-4 py-3.5 text-center text-[14px] font-semibold text-white"
        >
          Cotejar mis documentos
        </Link>
        <Link
          href="/tablero"
          className="text-center text-[11.5px] font-semibold text-accent underline underline-offset-2"
        >
          Ver cuánto vale esto, con datos reales →
        </Link>
        <p className="mt-2 text-center text-[10px] leading-relaxed text-muted-2">
          Proyecto de Nicolás Flores · Business Bending, Semana 3
        </p>
      </section>
    </main>
  );
}
