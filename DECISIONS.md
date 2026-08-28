# DECISIONS — Cotejo

Bitácora de decisiones de build. Se actualiza al cierre de cada sesión (`DECISIONS.md` + siguiente paso + commit + push), como pide el curso.

---

## Antes de la Sesión 1

- Packet (`docs/PACKET.md`) y mockup (`docs/mockup.png`) creados y pusheados antes de escribir código.
- `BUILD_PROMPT.md` escrito a partir del packet: modelo de datos, motor de cotejo (`cotejarDocumentos`), prompt de visión, piso de seguridad mapeado, y 8 commits chicos con criterio de aceptación cada uno.

## Sesión 1 — 2026-08-27

**Qué se decidió:**
- Scaffold con `create-next-app` (Next.js 16, App Router, TypeScript, Tailwind v4, `src/` dir, alias `@/*`), generado en un directorio temporal y fusionado a mano para no pisar `docs/`, `README.md`, `BUILD_PROMPT.md` ni `DECISIONS.md`.
- Fuente Public Sans (Google Fonts) y tokens de color (`--color-accent`, `--color-ink`, `--color-border`, `--color-muted`, `--color-muted-2`) en `globals.css`, tal como se diseñó en `docs/mockup-source/`.
- Dos rutas estáticas que replican `docs/mockup.png` pixel a pixel: `/` (Cotejo, con las 5 filas de ejemplo en sus 3 estados) y `/tablero` (métricas, distribución de resultados, modelos de entrega). Datos hardcodeados marcados `EJEMPLO` — sin lógica real todavía, eso arranca en el Commit 3.
- Verificado visualmente en viewport móvil (375×812) contra el mockup antes de commitear.
- Proyecto conectado a Vercel (`dime5/cotejo`), enlazado al repo de GitHub para autodeploy en cada push a `main`.

**Por qué:**
- Layout primero, sin lógica, para desplegar temprano (Commit 1 pide deploy 1) y confirmar que el pipeline GitHub → Vercel funciona antes de meter Supabase/Auth/visión.

**Problemas encontrados y cómo se resolvieron:**
- Misma caché global de npm rota que en Aforo (`~/.npm/_cacache` con permisos de una instalación anterior) → `EACCES`/`EEXIST`. Se resolvió igual: `npm_config_cache` apuntando a `.npm-cache/` local del proyecto (ya en `.gitignore`) en vez de tocar permisos del sistema.

**Deploy 1:** https://cotejo-psi.vercel.app — `/` y `/tablero` responden 200.

**Próximo paso:** Commit 2 — migración de Supabase (`checks`, `value_events`, `delivery_models` con RLS) + Sign in with Google.
