"use server";

import { validarEvidencias, type ArchivoEntrada } from "@/lib/validarEvidencias";

export type SubirEvidenciasResultado = {
  ok: boolean;
  errores: string[];
  archivos: ArchivoEntrada[];
};

// Commit 3: valida en el servidor (nunca confiar solo en la validación del
// cliente) y NO PERSISTE nada — los archivos se descartan al terminar esta
// función. La extracción con visión (Commit 4) y el cotejo (Commit 5) van
// a leer los bytes aquí mismo, en memoria, sin escribir a disco ni a
// Supabase Storage (decisión de privacidad del packet, sección 11).
export async function subirEvidencias(formData: FormData): Promise<SubirEvidenciasResultado> {
  const files = formData.getAll("evidencias").filter((f): f is File => f instanceof File);

  const entrada: ArchivoEntrada[] = files.map((f) => ({
    nombre: f.name,
    tipo: f.type,
    tamanoBytes: f.size,
  }));

  const resultado = validarEvidencias(entrada);

  // A partir de aquí (Commit 4) es donde cada `File` válido se lee con
  // `await file.arrayBuffer()` y se manda a la API de visión de Anthropic,
  // uno por uno, sin guardarlo en ningún lado.

  return { ok: resultado.ok, errores: resultado.errores, archivos: resultado.archivosValidos };
}
