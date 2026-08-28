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

## Sesión 2 — 2026-08-28

**Qué se decidió:**
- Proyecto de Supabase creado a mano por Nicolás (`btockirecdxmkuztokwr`) — la contraseña de la base de datos nunca se compartió conmigo a propósito. La migración (`supabase/migrations/0001_init.sql`, copia exacta del bloque SQL de `BUILD_PROMPT.md`) se corrió a mano en el SQL Editor del dashboard, no por CLI, precisamente por no tener esa contraseña.
- URL + anon key + service_role key configuradas como env vars en Vercel (`production`, `preview`, `development` — las 9 combinaciones) vía `vercel env add`, y en `.env.local` (gitignored) para desarrollo local. `NEXT_PUBLIC_SUPABASE_ANON_KEY` se agregó con `--type config` explícito — Vercel la marca por default como posible credencial por el prefijo `NEXT_PUBLIC_` y el que "parece" un secreto, pero es la llave anon: está diseñada para ser pública, la protege RLS.
- Wiring de `@supabase/supabase-js` + `@supabase/ssr`: `src/lib/supabase/client.ts` (browser), `server.ts` (Server Components/Actions, respeta RLS), `admin.ts` (service role, con `import "server-only"` para que el build truene si algo lo mete a un bundle de cliente — solo se va a usar para insertar en `value_events` en el Commit 6). `src/proxy.ts` refresca la sesión en cada request (el nombre `proxy.ts` en vez de `middleware.ts` es la convención de esta versión de Next — confirmado en `node_modules/next/dist/esm/server/web/adapter.js`, ambos nombres siguen funcionando).
- Botón de "Iniciar sesión con Google" (`AuthButton.tsx`, client component) agregado al pie de la pantalla de Cotejo, chico y aparte del flujo principal — el login nunca es requisito para cotejar, solo para guardar (packet, sección 4, paso 6).
- El proveedor de Google en sí (Supabase Auth → Providers → Google, con un client ID/secret de Google Cloud) queda pendiente — es un sub-paso aparte, no bloquea el resto del build.

**Por qué:**
- Nunca pedir la contraseña de la base de datos si hay una vía alternativa (SQL Editor manual) que no la necesita — la superficie de lo que un agente puede tocar se mantiene chica a propósito.
- `admin.ts` separado y marcado `server-only` en vez de un solo cliente "todo terreno": la Condición de seguridad #1 del piso (sin secretos expuestos) se vuelve un error de build, no una promesa de que "me voy a acordar de no importarlo mal".

**Verificado:**
- `curl` a `/rest/v1/delivery_models` con la anon key regresa las 3 filas sembradas (lectura pública funcionando).
- `curl` a `/rest/v1/checks` y `/rest/v1/value_events` con la anon key regresa `[]` (RLS bloqueando lo que debe bloquear; no hay filas todavía para probar el caso "otro user_id no puede leer las mías" — eso se prueba de verdad en el Commit 6/7 con datos reales).
- `npm run build` y `npm run lint` limpios. Probado visualmente en viewport móvil (375×812): el botón de login no rompe el layout del mockup.

**Próximo paso:** configurar el proveedor de Google en Supabase Auth (necesita un OAuth client de Google Cloud) para que el botón de login funcione de extremo a extremo. Después: Commit 3 (subida y validación de evidencias).

## Sesión 3 — 2026-08-28

**Qué se decidió:**
- Google Sign-in queda pendiente a propósito (decisión de Nicolás) — se sigue con Commit 3 sin bloquear en eso.
- `src/lib/validarEvidencias.ts`: función pura (tipo permitido, tamaño máx. 5MB, entre 2 y 4 archivos) + `validarEvidencias.test.ts` (6 casos, `node --experimental-strip-types --test`, agregado como script `npm test`). `tsconfig.json` excluye `**/*.test.ts` del build de Next — los imports con extensión `.ts` que pide la resolución nativa de Node chocaban con el type-check de `next build`.
- **Se evaluó y se descartó `image-size`** para validar dimensiones mínimas de imagen (lo que pedía el piso de seguridad #4 literalmente): tiene una vulnerabilidad de severidad alta sin parche (DoS por loop infinito parseando ICNS/JXL/HEIF disfrazados de PNG/JPEG — justo el escenario de un archivo hostil con extensión falsa). Se desinstaló; la validación se queda en tipo + tamaño, que es lo que de verdad exige el criterio de aceptación del ship. Documentado como trade-off deliberado, no como pendiente.
- `next.config.ts`: `serverActions.bodySizeLimit` subido a 25mb para que un archivo de prueba de 20MB llegue completo al server action y lo rechace nuestra validación (mensaje claro) en vez de que Next lo tumbe con un 413 genérico antes.
- `CotejoUpload.tsx` (client component) reemplaza la cuadrícula estática de miniaturas en `/`: subida real de 2-4 archivos, validación en cliente Y en servidor (server action `subirEvidencias`, que no persiste nada), estado de éxito/error inline. La tabla de ejemplo de abajo se dejó intacta pero renombrada "Vista previa · EJEMPLO" para que no se lea como si estuviera conectada a lo que se acaba de subir — el cotejo real todavía no existe (Commit 5).

**Verificado:**
- 6/6 tests de `validarEvidencias` pasan. `npm run build` y `npm run lint` limpios.
- End-to-end en el navegador (archivos simulados por JS, ya que este entorno no tiene diálogo nativo de OS): 4 archivos válidos → "✓ 4 evidencias válidas"; 1 archivo de 6MB + 1 `.exe` → rechazados con el mismo mensaje en cliente y en servidor (confirmado por log: dos llamadas a `subirEvidencias`, ambas 200, sin crash).

**Próximo paso:** Commit 4 — extracción con visión (API de Anthropic, un documento a la vez, con defensa contra inyección por imagen). Necesito que consigas una `ANTHROPIC_API_KEY` (console.anthropic.com) cuando sigamos con eso.
