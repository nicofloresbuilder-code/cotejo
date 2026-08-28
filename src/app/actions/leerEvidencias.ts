"use server";

import { validarEvidencias, type ArchivoEntrada } from "@/lib/validarEvidencias";
import { extraerEntidades, type ExtraccionResultado } from "@/lib/vision/extraerEntidades";
import { calcularCostoMxn } from "@/lib/costo";

export type LeerEvidenciasResultado = {
  ok: boolean;
  errores: string[];
  documentos: ExtraccionResultado[];
  costoVariableMxn: number; // suma real de todo el lote — ver src/lib/costo.ts
};

// Commit 4: valida (igual que subirEvidencias) y, si pasa, manda cada
// documento POR SEPARADO a la API de visión — nunca los documentos juntos
// en una sola llamada, para que la procedencia de cada campo quede clara
// por construcción. Sigue sin persistir nada: los bytes solo viven en esta
// invocación.
export async function leerEvidencias(formData: FormData): Promise<LeerEvidenciasResultado> {
  const files = formData.getAll("evidencias").filter((f): f is File => f instanceof File);

  const entrada: ArchivoEntrada[] = files.map((f) => ({
    nombre: f.name,
    tipo: f.type,
    tamanoBytes: f.size,
  }));

  const validacion = validarEvidencias(entrada);
  if (!validacion.ok) {
    return { ok: false, errores: validacion.errores, documentos: [], costoVariableMxn: 0 };
  }

  const nombresValidos = new Set(validacion.archivosValidos.map((a) => a.nombre));
  const archivosValidos = files.filter((f) => nombresValidos.has(f.name));

  const documentos = await Promise.all(
    archivosValidos.map(async (f) => {
      const buffer = await f.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const resultado = await extraerEntidades(f.name, f.type, base64);
      // Visibilidad en consola para el Commit 4 (procedencia + campos extraídos).
      console.log(`[vision] ${f.name}:`, JSON.stringify(resultado.entidades));
      return resultado;
    }),
  );

  const inputTotal = documentos.reduce((s, d) => s + d.tokens.input, 0);
  const outputTotal = documentos.reduce((s, d) => s + d.tokens.output, 0);
  const costoVariableMxn = calcularCostoMxn(inputTotal, outputTotal);

  return { ok: true, errores: [], documentos, costoVariableMxn };
}
