// Costo variable real por cotejo (packet, Superficie B) — calculado del
// consumo REAL de tokens de la API de visión (response.usage), no
// estimado. Ver src/lib/vision/extraerEntidades.ts, donde se capturan
// input_tokens/output_tokens de cada llamada real.

// Precios de Claude Haiku 4.5 en USD por millón de tokens (agosto 2026).
// Si ANTHROPIC_VISION_MODEL cambia de modelo, estos precios hay que
// actualizarlos a mano — no hay forma de leerlos de la API.
export const PRECIO_USD_POR_MILLON_INPUT = 1.0;
export const PRECIO_USD_POR_MILLON_OUTPUT = 5.0;

// Aproximado, NO es un tipo de cambio en vivo — suficiente para dar una
// idea de magnitud en pesos, no para contabilidad real.
export const USD_A_MXN_APROX = 18.5;

export function calcularCostoMxn(inputTokens: number, outputTokens: number): number {
  const usd =
    (inputTokens / 1_000_000) * PRECIO_USD_POR_MILLON_INPUT +
    (outputTokens / 1_000_000) * PRECIO_USD_POR_MILLON_OUTPUT;
  return usd * USD_A_MXN_APROX;
}
