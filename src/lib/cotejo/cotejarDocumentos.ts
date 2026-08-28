// El motor de cotejo — el equivalente de este proyecto a una fórmula de
// precio: una función pura, determinista, testeable sin UI y sin red.
// Corre DESPUÉS de que la visión (src/lib/vision/) ya extrajo los campos
// de cada documento por separado.

export type Documento = { fuente: string; campos: Record<string, string | null> };
export type Estado = "coincide" | "contradice" | "sin_evidencia";
export type ResultadoCampo = { estado: Estado; valores: { fuente: string; valor: string }[] };

export const CAMPOS_CANONICOS = [
  "razon_social",
  "rfc",
  "titular_cuenta",
  "domicilio",
  "telefono",
] as const;

export type CampoCanonico = (typeof CAMPOS_CANONICOS)[number];

function normalizar(v: string): string {
  return v
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quita acentos
    .replace(/\s+/g, " ");
}

function cotejarCampo(documentos: Documento[], campo: string): ResultadoCampo {
  const presentes = documentos
    .filter((d) => d.campos[campo])
    .map((d) => ({ fuente: d.fuente, valor: d.campos[campo] as string }));

  if (presentes.length < 2) {
    // 0 fuentes: no aparece en nada. 1 fuente: no hay con qué corroborar.
    // Ambos casos son "sin_evidencia" — la Condición 1 prohíbe tratar
    // "solo una fuente" como señal positiva encubierta. Ver DECISIONS.md.
    return { estado: "sin_evidencia", valores: presentes };
  }

  const todosIguales = presentes.every((p) => normalizar(p.valor) === normalizar(presentes[0].valor));
  return { estado: todosIguales ? "coincide" : "contradice", valores: presentes };
}

export function cotejarDocumentos(
  documentos: Documento[],
): Record<CampoCanonico, ResultadoCampo> {
  return Object.fromEntries(
    CAMPOS_CANONICOS.map((campo) => [campo, cotejarCampo(documentos, campo)]),
  ) as Record<CampoCanonico, ResultadoCampo>;
}
