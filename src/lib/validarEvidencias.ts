// Piso de seguridad #4: nada entra sin validar tipo y tamaño. Deliberadamente
// NO se valida dimensión de imagen aquí — la librería obvia para eso
// (image-size) tiene una vulnerabilidad de DoS sin parche (loop infinito al
// parsear ICNS/JXL/HEIF disfrazados de PNG/JPEG); el costo de esa
// verificación no vale la superficie de ataque que abre. Ver DECISIONS.md.

export const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "application/pdf"] as const;
export const TAMANO_MAXIMO_BYTES = 5 * 1024 * 1024; // 5 MB
export const MIN_EVIDENCIAS = 2;
export const MAX_EVIDENCIAS = 4;

export type ArchivoEntrada = {
  nombre: string;
  tipo: string;
  tamanoBytes: number;
};

export type ResultadoValidacion = {
  ok: boolean;
  errores: string[];
  archivosValidos: ArchivoEntrada[];
};

function formatoMB(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1);
}

export function validarEvidencias(archivos: ArchivoEntrada[]): ResultadoValidacion {
  const errores: string[] = [];

  if (archivos.length < MIN_EVIDENCIAS) {
    errores.push(`Sube al menos ${MIN_EVIDENCIAS} evidencias (subiste ${archivos.length}).`);
  }
  if (archivos.length > MAX_EVIDENCIAS) {
    errores.push(`Máximo ${MAX_EVIDENCIAS} evidencias (subiste ${archivos.length}).`);
  }

  const archivosValidos: ArchivoEntrada[] = [];

  for (const archivo of archivos) {
    if (!TIPOS_PERMITIDOS.includes(archivo.tipo as (typeof TIPOS_PERMITIDOS)[number])) {
      errores.push(`"${archivo.nombre}" no es un tipo permitido (solo JPG, PNG o PDF).`);
      continue;
    }
    if (archivo.tamanoBytes > TAMANO_MAXIMO_BYTES) {
      errores.push(
        `"${archivo.nombre}" pesa ${formatoMB(archivo.tamanoBytes)}MB — el máximo es 5MB.`,
      );
      continue;
    }
    if (archivo.tamanoBytes <= 0) {
      errores.push(`"${archivo.nombre}" llegó vacío.`);
      continue;
    }
    archivosValidos.push(archivo);
  }

  return { ok: errores.length === 0, errores, archivosValidos };
}
