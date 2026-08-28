import { test } from "node:test";
import assert from "node:assert/strict";
import { generarMensajeWhatsApp } from "./generarMensajeWhatsApp.ts";
import type { CampoCanonico, ResultadoCampo } from "../cotejo/cotejarDocumentos.ts";

function resultado(parcial: Partial<Record<CampoCanonico, ResultadoCampo>>) {
  const base: Record<CampoCanonico, ResultadoCampo> = {
    razon_social: { estado: "coincide", valores: [] },
    rfc: { estado: "coincide", valores: [] },
    titular_cuenta: { estado: "coincide", valores: [] },
    domicilio: { estado: "coincide", valores: [] },
    telefono: { estado: "coincide", valores: [] },
  };
  return { ...base, ...parcial };
}

test("todo coincide -> null (no hay nada que pedir)", () => {
  assert.equal(generarMensajeWhatsApp(resultado({})), null);
});

test("solo sin_evidencia -> pide compartir, sin mencionar contradicción", () => {
  const msg = generarMensajeWhatsApp(resultado({ rfc: { estado: "sin_evidencia", valores: [] } }));
  assert.ok(msg);
  assert.match(msg!, /compartes/);
  assert.match(msg!, /RFC/);
  assert.doesNotMatch(msg!, /distintos/);
});

test("solo contradice -> pide confirmar, menciona datos distintos", () => {
  const msg = generarMensajeWhatsApp(
    resultado({ titular_cuenta: { estado: "contradice", valores: [] } }),
  );
  assert.ok(msg);
  assert.match(msg!, /confirmas/);
  assert.match(msg!, /titular de la cuenta/);
  assert.match(msg!, /distintos/);
});

test("sin_evidencia y contradice a la vez -> incluye ambas preguntas", () => {
  const msg = generarMensajeWhatsApp(
    resultado({
      telefono: { estado: "sin_evidencia", valores: [] },
      rfc: { estado: "contradice", valores: [] },
    }),
  );
  assert.ok(msg);
  assert.match(msg!, /compartes/);
  assert.match(msg!, /confirmas/);
});

test("nunca usa lenguaje acusatorio o de veredicto (cláusula sombra)", () => {
  const msg = generarMensajeWhatsApp(
    resultado({
      rfc: { estado: "sin_evidencia", valores: [] },
      titular_cuenta: { estado: "contradice", valores: [] },
    }),
  );
  assert.ok(msg);
  for (const palabra of ["sospech", "riesgo", "confiable", "fraude", "alerta", "cuidado"]) {
    assert.doesNotMatch(msg!.toLowerCase(), new RegExp(palabra));
  }
});
