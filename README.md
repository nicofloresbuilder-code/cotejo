# Cotejo

**Business Bending · Semana 3 — "When nothing can be verified"**
Nicolás Flores · Team 5

Un *payer-and-value test*: antes de que un dueño de negocio mexicano mande un anticipo por SPEI a una contraparte nueva por WhatsApp, Cotejo compara entre sí la evidencia que ya tiene en el teléfono (cotización, constancia fiscal, perfil, CLABE) y muestra, campo por campo, qué **coincide**, qué **contradice** y qué está **sin evidencia** — sin emitir jamás un veredicto de confiabilidad. En paralelo, un tablero público mide cuánto vale ese cotejo en pesos por transacción.

## Estado

📋 Packet listo — ver [`docs/PACKET.md`](docs/PACKET.md), mockup en [`docs/mockup.png`](docs/mockup.png).
🤖 Implementation prompt listo — ver [`BUILD_PROMPT.md`](BUILD_PROMPT.md).
🧑‍💻 Build: Commits 1-4 hechos (scaffold + Supabase/Auth wiring + subida/validación + lectura real con visión). Live: **https://cotejo-psi.vercel.app**
📓 Bitácora de sesiones: [`DECISIONS.md`](DECISIONS.md).

## Stack (planeado)

Next.js (App Router) + TypeScript · Tailwind CSS · Vercel · API de Anthropic (visión) · Supabase (Postgres + Auth + RLS) · Recharts.

Ver la sección 11 del packet para el detalle de arquitectura y la sección 9 para cómo se honran las condiciones del Blueprint.
