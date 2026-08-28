import "server-only";
import { getAnthropicClient, MODELO_VISION } from "@/lib/anthropic";
import {
  ENTIDADES_VACIAS,
  SYSTEM_PROMPT_VISION,
  parsearRespuestaVision,
  type EntidadesDocumento,
} from "./entidades";

export type ExtraccionResultado = {
  archivo: string;
  entidades: EntidadesDocumento;
  error?: string; // fallo de red/API en ESTE documento — no debe tumbar a los demás
};

/**
 * Manda UN documento a la API de Anthropic y regresa sus entidades con
 * procedencia (el nombre de archivo la lleva quien llama esta función).
 * Nunca lanza — un fallo de red/API se refleja en `error`, con entidades
 * vacías, para que el resto de los documentos se puedan seguir procesando.
 */
export async function extraerEntidades(
  archivo: string,
  tipo: string,
  base64: string,
): Promise<ExtraccionResultado> {
  try {
    const client = getAnthropicClient();

    const contenido =
      tipo === "application/pdf"
        ? ({
            type: "document",
            source: { type: "base64", media_type: "application/pdf", data: base64 },
          } as const)
        : ({
            type: "image",
            source: { type: "base64", media_type: tipo as "image/jpeg" | "image/png", data: base64 },
          } as const);

    const respuesta = await client.messages.create({
      model: MODELO_VISION,
      max_tokens: 1024,
      system: SYSTEM_PROMPT_VISION,
      messages: [
        {
          role: "user",
          content: [contenido, { type: "text", text: "Extrae las entidades de este documento." }],
        },
      ],
    });

    const bloqueTexto = respuesta.content.find((b) => b.type === "text");
    if (!bloqueTexto || bloqueTexto.type !== "text") {
      return { archivo, entidades: { ...ENTIDADES_VACIAS }, error: "El modelo no regresó texto." };
    }

    return { archivo, entidades: parsearRespuestaVision(bloqueTexto.text) };
  } catch (err) {
    return {
      archivo,
      entidades: { ...ENTIDADES_VACIAS },
      error: err instanceof Error ? err.message : "Error desconocido al leer el documento.",
    };
  }
}
