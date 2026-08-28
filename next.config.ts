import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Hasta 4 archivos de 5MB c/u (ver src/lib/validarEvidencias.ts) — el
    // límite de arriba es para que nuestra validación (mensaje claro) sea
    // la que rechaza un archivo grande, no un 413 genérico del framework.
    serverActions: { bodySizeLimit: "25mb" },
  },
};

export default nextConfig;
