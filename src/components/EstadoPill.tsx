const estilos = {
  coincide: "bg-emerald-50 text-emerald-700",
  contradice: "bg-amber-100 text-amber-700",
  sin_evidencia: "bg-gray-100 text-gray-500",
} as const;

const etiquetas = {
  coincide: "Coincide",
  contradice: "Contradice",
  sin_evidencia: "Sin evidencia",
} as const;

export function EstadoPill({ estado }: { estado: keyof typeof estilos }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${estilos[estado]}`}
    >
      {etiquetas[estado]}
    </span>
  );
}
