// Constantes + tipos compartidos entre el server action (guardarEventoValor)
// y la UI. Viven aparte porque un archivo "use server" SOLO puede exportar
// funciones async — cualquier otro export (una const, un array) rompe el
// build ("A 'use server' file can only export async functions").

export const ACCIONES = ["pague", "pedi_mas_evidencia", "pague_distinto", "no_pague"] as const;
export type Accion = (typeof ACCIONES)[number];

export const DISPOSICIONES_PAGO = ["gratis", "menos_de_50", "50_a_200", "mas_de_200"] as const;
export type DisposicionPago = (typeof DISPOSICIONES_PAGO)[number];

export type EventoValorEntrada = {
  montoMxn: number | null;
  tiempoSegundos: number;
  nEvidencias: number;
  distribucion: { coincide: number; contradice: number; sin_evidencia: number };
  accion: Accion;
  disposicionPago: DisposicionPago | null;
};
