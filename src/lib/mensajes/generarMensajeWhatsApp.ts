import {
  CAMPOS_CANONICOS,
  type CampoCanonico,
  type ResultadoCampo,
} from "../cotejo/cotejarDocumentos.ts";

// Etiquetas para insertar a media oración (minúsculas, salvo siglas) —
// distintas de las etiquetas de la UI (que sí llevan mayúscula inicial).
const ETIQUETA_ORACION: Record<CampoCanonico, string> = {
  razon_social: "razón social",
  rfc: "RFC",
  titular_cuenta: "titular de la cuenta",
  domicilio: "domicilio",
  telefono: "teléfono",
};

function joinConY(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;
}

/**
 * Condición 4 (cláusula sombra) en código: el mensaje PIDE, nunca acusa.
 * No menciona "sospecha", "riesgo" ni nada parecido a un veredicto — solo
 * nombra el campo y pide el dato. `sin_evidencia` y `contradice` se piden
 * distinto porque la pregunta real es distinta (compartir vs. confirmar),
 * pero ninguna asume mala fe.
 *
 * Regresa `null` cuando todo coincide (o no hay nada en contradice/sin
 * evidencia) — no hay nada que pedir.
 */
export function generarMensajeWhatsApp(
  resultado: Record<CampoCanonico, ResultadoCampo>,
): string | null {
  const faltantes = CAMPOS_CANONICOS.filter((c) => resultado[c].estado === "sin_evidencia").map(
    (c) => ETIQUETA_ORACION[c],
  );
  const contradictorios = CAMPOS_CANONICOS.filter(
    (c) => resultado[c].estado === "contradice",
  ).map((c) => ETIQUETA_ORACION[c]);

  if (faltantes.length === 0 && contradictorios.length === 0) return null;

  const partes: string[] = [];
  if (faltantes.length > 0) {
    partes.push(`¿me compartes tu ${joinConY(faltantes)}?`);
  }
  if (contradictorios.length > 0) {
    partes.push(
      `¿me confirmas cuál es tu ${joinConY(contradictorios)} correcto? Vi datos distintos entre tus documentos.`,
    );
  }

  return `Antes de pasar el anticipo, ${partes.join(" Y ")} Solo para tener todo parejo de mi lado.`;
}
