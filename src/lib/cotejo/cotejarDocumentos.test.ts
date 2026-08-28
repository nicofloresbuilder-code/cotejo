import { test } from "node:test";
import assert from "node:assert/strict";
import { cotejarDocumentos, type Documento } from "./cotejarDocumentos.ts";

test("2 fuentes con el mismo valor -> coincide", () => {
  const docs: Documento[] = [
    { fuente: "a.png", campos: { razon_social: "Tarimas del Bajío SA de CV" } },
    { fuente: "b.png", campos: { razon_social: "TARIMAS DEL BAJÍO SA DE CV" } },
  ];
  const r = cotejarDocumentos(docs);
  assert.equal(r.razon_social.estado, "coincide");
  assert.equal(r.razon_social.valores.length, 2);
});

test("2 fuentes con valores distintos -> contradice, ambos literales", () => {
  const docs: Documento[] = [
    { fuente: "cotizacion.pdf", campos: { titular_cuenta: "Tarimas del Bajío SA de CV" } },
    { fuente: "clabe.png", campos: { titular_cuenta: "Juan Carlos Ramírez López" } },
  ];
  const r = cotejarDocumentos(docs);
  assert.equal(r.titular_cuenta.estado, "contradice");
  assert.deepEqual(
    r.titular_cuenta.valores.map((v) => v.valor),
    ["Tarimas del Bajío SA de CV", "Juan Carlos Ramírez López"],
  );
});

test("0 fuentes -> sin_evidencia", () => {
  const docs: Documento[] = [{ fuente: "a.png", campos: {} }, { fuente: "b.png", campos: {} }];
  const r = cotejarDocumentos(docs);
  assert.equal(r.rfc.estado, "sin_evidencia");
  assert.equal(r.rfc.valores.length, 0);
});

test("1 sola fuente -> sin_evidencia, no coincide (no hay con qué corroborar)", () => {
  const docs: Documento[] = [
    { fuente: "a.png", campos: { domicilio: "Av. Insurgentes Sur 1234, CDMX" } },
    { fuente: "b.png", campos: {} },
  ];
  const r = cotejarDocumentos(docs);
  assert.equal(r.domicilio.estado, "sin_evidencia");
  assert.equal(r.domicilio.valores.length, 1);
});

test("3+ fuentes, todas iguales -> coincide", () => {
  const docs: Documento[] = [
    { fuente: "a", campos: { telefono: "5512345678" } },
    { fuente: "b", campos: { telefono: "5512345678" } },
    { fuente: "c", campos: { telefono: "5512345678" } },
  ];
  assert.equal(cotejarDocumentos(docs).telefono.estado, "coincide");
});

test("3+ fuentes, una discrepante -> contradice", () => {
  const docs: Documento[] = [
    { fuente: "a", campos: { telefono: "5512345678" } },
    { fuente: "b", campos: { telefono: "5512345678" } },
    { fuente: "c", campos: { telefono: "5599999999" } },
  ];
  assert.equal(cotejarDocumentos(docs).telefono.estado, "contradice");
});

test("nunca agrega un campo fuera de CAMPOS_CANONICOS (Condición 1)", () => {
  const docs: Documento[] = [
    { fuente: "a", campos: { monto: "100", clabe: "x" } },
    { fuente: "b", campos: { monto: "100", clabe: "x" } },
  ];
  const r = cotejarDocumentos(docs);
  assert.equal("monto" in r, false);
  assert.equal("clabe" in r, false);
});

test("la normalización ignora mayúsculas, acentos y espacios extra", () => {
  const docs: Documento[] = [
    { fuente: "a", campos: { razon_social: "  José   Ramírez  " } },
    { fuente: "b", campos: { razon_social: "JOSE RAMIREZ" } },
  ];
  assert.equal(cotejarDocumentos(docs).razon_social.estado, "coincide");
});
