# PERSONA — Cotejo

## Prueba adversarial de equidad (packet, sección 12)

**Cuándo:** Sesión 8, 28 de agosto de 2026.
**Qué se probó:** el sistema real — prompt de visión real, `cotejarDocumentos()` real, 12 llamadas reales a la API de Anthropic (una por documento, 24 documentos) — nunca simulado.
**Hipótesis a refutar (textual del packet):** *"que la contraparte informal produce visualmente un resultado más adverso aunque no haya ninguna contradicción real."*

### Metodología

12 casos pareados, cada uno con 2 documentos de EJEMPLO (datos 100% inventados, marca visible en cada imagen). **Ningún caso tiene una contradicción real fabricada a propósito** — la pregunta es si el resultado se ve peor para un grupo sin que exista ninguna inconsistencia de fondo.

- **6 formales** (F1–F6): empresa con razón social, factura/cotización + constancia, mismo RFC y domicilio repetidos en ambos documentos — el patrón de papeleo de una empresa establecida.
- **6 informales, cada uno con un rasgo distinto, todos perfectamente legítimos** (I1–I6): persona física con actividad empresarial · sin factura (solo WhatsApp) · cuenta a nombre del cónyuge · sin presencia digital · constancia vieja · negocio familiar sin razón social.

Script: `supabase/verificar-equidad.mjs` (reusa `SYSTEM_PROMPT_VISION` y `cotejarDocumentos()` reales; solo reimplementa la llamada de red porque esos archivos usan el alias `@/` que Node no resuelve fuera de Next). Los 24 documentos fuente son reproducibles desde el script generador usado en la sesión (no se guardaron las imágenes en el repo — son datos de prueba, no parte del producto).

### Resultado (promedio de 5 campos canónicos por caso)

| Grupo | Coincide | Contradice | Sin evidencia |
|---|---|---|---|
| Formal (F1–F6) | **2.67** | 0.33 | 2.00 |
| Informal (I1–I6) | **0.33** | 0.00 | **4.67** |

Detalle campo por campo, y el resultado completo de la corrida, están en el log de la sesión (`DECISIONS.md`, Sesión 8).

### La hipótesis NO se refuta

El grupo informal cae en *sin evidencia* en promedio **4.67 de 5 campos**, contra **2.00 de 5** del grupo formal — sin que exista una sola contradicción real de por medio en ningún caso informal. La razón no es ningún sesgo en el prompt ni en `cotejarDocumentos()`: es estructural. Una empresa formal manda dos documentos (cotización + constancia) que **repiten** los mismos tres campos (razón social, RFC, domicilio), así que esos campos casi siempre tienen ≥2 fuentes y llegan a *coincide*. Un proveedor informal manda, por ejemplo, un mensaje de WhatsApp con su nombre y teléfono, y luego una captura de CLABE con el titular de la cuenta — cada campo aparece en **un solo** documento, y la regla ya documentada ("menos de 2 fuentes = sin evidencia") lo deja ahí, correctamente, sin inventar una corroboración que no existe.

El resultado es honesto campo por campo — pero **la pantalla completa** de un cotejo informal es casi toda gris, mientras que la de uno formal es casi toda verde. Aunque cada fila individual dice explícitamente "esto no es una señal negativa", la impresión visual de conjunto — "aquí no se confirmó nada" — es exactamente el resultado más adverso que la Condición 4 (cláusula sombra) prohíbe que el producto produzca por la sola forma en que alguien hace negocios.

**Esto es incómodo porque el diseño ya intentaba evitarlo** (tres estados separados, *sin evidencia* nunca en rojo, leyenda explícita) — y aun así, a nivel de la pantalla completa, el problema seguía ahí.

### Hallazgo secundario: OCR no determinista puede fabricar una contradicción falsa

Al investigar dos contradicciones inesperadas en el grupo *formal* (F1 y F5, sección "razón social" — casos donde el texto fuente era **idéntico** en ambos documentos), se confirmó que el modelo de visión en una corrida leyó "Iluminacion Profesional SA de CV" en un documento y **"Illuminacion"** (con una L de más) en el otro — un error de OCR del propio modelo, no del código. `cotejarDocumentos()` hizo exactamente lo que debía con el texto que recibió; el problema es que la extracción no es 100% determinista entre llamadas. **No se corrigió en esta sesión** — cambiar la comparación a una tolerancia por distancia de edición es una decisión de producto (¿qué tanto parecido es "igual"?) que no se debe apurar bajo presión de tiempo; se deja documentado como límite conocido para una sesión futura, en vez de fingir que no pasó.

### Corrección aplicada (packet: "si la hipótesis no se refuta, se corrige el diseño visual")

Se agregó un aviso que aparece **antes** de la tabla de resultados cuando 3 o más de los 5 campos caen en *sin evidencia*: *"La mayoría de estos datos no aparecen en lo que subiste — es normal con proveedores que cotizan por WhatsApp o no manejan factura. Ninguno de estos campos es una señal negativa; solo pide lo que falta con el mensaje de abajo."*

La corrección no toca el cotejo ni los datos — es puramente de encuadre: en vez de que el lector llegue primero a una pantalla gris y tenga que inferir por su cuenta que eso es normal, se le dice antes de verla, explícitamente, para el patrón exacto (proveedor informal) que este hallazgo mostró que más lo necesita. Verificado en vivo con el caso I1 real — el aviso aparece correctamente antes de la tabla. Ver `src/components/CotejoUpload.tsx` (`sinEvidenciaMayoria`) y `DECISIONS.md`, Sesión 8.

---

## Persona test (Layer 1) — PENDIENTE

Por instrucción de `BUILD_PROMPT.md`, esto se hace en una conversación **nueva y separada** (no la sigue el coding agent): se le pega a un LLM fresco el prompt de Rocío de la sección 12 del packet, se le pasan capturas de cada pantalla en orden, y se registra aquí dónde duda, qué no entiende, y dónde abandonaría — con atención especial a si interpreta algún campo en *sin evidencia* como señal negativa a pesar del texto.
