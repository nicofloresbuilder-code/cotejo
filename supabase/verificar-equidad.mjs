// Prueba adversarial de equidad (packet, sección 12 — la cláusula sombra
// convertida en test). 12 casos pareados: 6 contrapartes FORMALES (empresa
// con razón social, factura, constancia, cuenta empresarial a nombre
// propio) y 6 INFORMALES pero perfectamente legítimas (persona física,
// sin factura, cuenta a nombre del cónyuge, sin presencia digital,
// constancia vieja, negocio familiar sin razón social). NINGÚN caso tiene
// una contradicción real a propósito — la hipótesis a refutar es que el
// grupo informal produce visualmente un resultado más adverso aunque no
// haya ninguna inconsistencia de verdad.
//
// Reusa el prompt de visión y el motor de cotejo REALES (src/lib/vision,
// src/lib/cotejo) — solo re-implementa la llamada de red porque esos
// archivos usan el alias "@/" que node plano no resuelve fuera de Next.
//
// Uso: ANTHROPIC_API_KEY=... node supabase/verificar-equidad.mjs

import { readFile } from "node:fs/promises";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT_VISION, parsearRespuestaVision } from "../src/lib/vision/entidades.ts";
import { cotejarDocumentos, CAMPOS_CANONICOS } from "../src/lib/cotejo/cotejarDocumentos.ts";

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error("Falta ANTHROPIC_API_KEY.");
  process.exit(1);
}
const client = new Anthropic({ apiKey });
const MODELO = process.env.ANTHROPIC_VISION_MODEL || "claude-haiku-4-5-20251001";
const DIR = "/tmp/cotejo_equidad";

async function extraer(nombreArchivo) {
  const buffer = await readFile(`${DIR}/${nombreArchivo}.png`);
  const base64 = buffer.toString("base64");
  const respuesta = await client.messages.create({
    model: MODELO,
    max_tokens: 1024,
    system: SYSTEM_PROMPT_VISION,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: "image/png", data: base64 } },
          { type: "text", text: "Extrae las entidades de este documento." },
        ],
      },
    ],
  });
  const bloque = respuesta.content.find((b) => b.type === "text");
  return parsearRespuestaVision(bloque.text);
}

const CASOS = [
  { id: "F1", grupo: "formal", archivos: ["F1_a", "F1_b"] },
  { id: "F2", grupo: "formal", archivos: ["F2_a", "F2_b"] },
  { id: "F3", grupo: "formal", archivos: ["F3_a", "F3_b"] },
  { id: "F4", grupo: "formal", archivos: ["F4_a", "F4_b"] },
  { id: "F5", grupo: "formal", archivos: ["F5_a", "F5_b"] },
  { id: "F6", grupo: "formal", archivos: ["F6_a", "F6_b"] },
  { id: "I1", grupo: "informal", rasgo: "persona física con actividad empresarial", archivos: ["I1_a", "I1_b"] },
  { id: "I2", grupo: "informal", rasgo: "sin factura (solo WhatsApp)", archivos: ["I2_a", "I2_b"] },
  { id: "I3", grupo: "informal", rasgo: "cuenta a nombre del cónyuge", archivos: ["I3_a", "I3_b"] },
  { id: "I4", grupo: "informal", rasgo: "sin presencia digital", archivos: ["I4_a", "I4_b"] },
  { id: "I5", grupo: "informal", rasgo: "constancia vieja", archivos: ["I5_a", "I5_b"] },
  { id: "I6", grupo: "informal", rasgo: "negocio familiar sin razón social", archivos: ["I6_a", "I6_b"] },
];

const resultados = [];

for (const caso of CASOS) {
  const documentos = [];
  for (const archivo of caso.archivos) {
    const entidades = await extraer(archivo);
    documentos.push({ fuente: archivo, campos: entidades });
  }
  const cotejo = cotejarDocumentos(documentos);

  let coincide = 0,
    contradice = 0,
    sinEvidencia = 0;
  for (const campo of CAMPOS_CANONICOS) {
    const estado = cotejo[campo].estado;
    if (estado === "coincide") coincide++;
    else if (estado === "contradice") contradice++;
    else sinEvidencia++;
  }

  resultados.push({ ...caso, coincide, contradice, sinEvidencia, cotejo });
  console.log(
    `${caso.id} (${caso.grupo}${caso.rasgo ? " — " + caso.rasgo : ""}): coincide=${coincide} contradice=${contradice} sin_evidencia=${sinEvidencia}`,
  );
}

function promedio(grupo, campo) {
  const filas = resultados.filter((r) => r.grupo === grupo);
  return filas.reduce((s, r) => s + r[campo], 0) / filas.length;
}

console.log("\n--- Promedios por grupo (sobre 5 campos por caso) ---");
console.log(
  `Formal:    coincide=${promedio("formal", "coincide").toFixed(2)} contradice=${promedio("formal", "contradice").toFixed(2)} sin_evidencia=${promedio("formal", "sinEvidencia").toFixed(2)}`,
);
console.log(
  `Informal:  coincide=${promedio("informal", "coincide").toFixed(2)} contradice=${promedio("informal", "contradice").toFixed(2)} sin_evidencia=${promedio("informal", "sinEvidencia").toFixed(2)}`,
);

const contradiceTotal = resultados.reduce((s, r) => s + r.contradice, 0);
console.log(
  `\nContradicciones reales fabricadas en los 12 casos: 0 (a propósito). Contradicciones que el sistema detectó: ${contradiceTotal}.`,
);

console.log("\n--- Detalle por campo, caso por caso ---");
for (const r of resultados) {
  const detalle = CAMPOS_CANONICOS.map((c) => `${c}:${r.cotejo[c].estado}`).join(" ");
  console.log(`${r.id.padEnd(3)} ${r.grupo.padEnd(9)} ${detalle}`);
}
