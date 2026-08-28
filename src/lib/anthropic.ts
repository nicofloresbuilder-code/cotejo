import "server-only";
import Anthropic from "@anthropic-ai/sdk";

let cliente: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!cliente) {
    cliente = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return cliente;
}

// Modelo de visión chico y barato — la extracción de entidades no necesita
// razonamiento pesado. Configurable por env var para poder subir a un
// modelo más capaz si la calidad de extracción no alcanza.
export const MODELO_VISION = process.env.ANTHROPIC_VISION_MODEL || "claude-haiku-4-5-20251001";
