import { test } from "node:test";
import assert from "node:assert/strict";
import { parsearRespuestaVision } from "./entidades.ts";

test("parsea JSON limpio", () => {
  const r = parsearRespuestaVision(
    '{"razon_social":"Tarimas del Bajío SA de CV","rfc":null,"nombre_persona_fisica":null,"clabe":null,"banco":null,"titular_cuenta":null,"domicilio":null,"telefono":null,"regimen_fiscal":null,"folio":null,"monto":null,"posible_inyeccion":false}',
  );
  assert.equal(r.razon_social, "Tarimas del Bajío SA de CV");
  assert.equal(r.rfc, null);
  assert.equal(r.posible_inyeccion, false);
});

test("quita el fence de markdown ```json ... ```", () => {
  const r = parsearRespuestaVision('```json\n{"rfc":"XAXX010101000"}\n```');
  assert.equal(r.rfc, "XAXX010101000");
});

test("JSON malformado no truena — regresa entidades vacías", () => {
  const r = parsearRespuestaVision("esto no es json {rota");
  assert.equal(r.razon_social, null);
  assert.equal(r.posible_inyeccion, false);
});

test("respuesta que no es un objeto (array, string, número) no truena", () => {
  assert.equal(parsearRespuestaVision("[1,2,3]").razon_social, null);
  assert.equal(parsearRespuestaVision('"hola"').razon_social, null);
  assert.equal(parsearRespuestaVision("42").razon_social, null);
});

test("campos faltantes se rellenan con null, campos extra se ignoran", () => {
  const r = parsearRespuestaVision('{"rfc":"ABC123","campo_inventado":"algo"}');
  assert.equal(r.rfc, "ABC123");
  assert.equal(r.domicilio, null);
  assert.equal("campo_inventado" in r, false);
});

test("string vacío o solo espacios en un campo se normaliza a null", () => {
  const r = parsearRespuestaVision('{"telefono":"   "}');
  assert.equal(r.telefono, null);
});

test("posible_inyeccion: true se detecta el intento (Test #7 del packet)", () => {
  const r = parsearRespuestaVision(
    '{"razon_social":"Tarimas SA","posible_inyeccion":true}',
  );
  assert.equal(r.posible_inyeccion, true);
  assert.equal(r.razon_social, "Tarimas SA");
});

test("posible_inyeccion con valor no booleano se normaliza a false", () => {
  const r = parsearRespuestaVision('{"posible_inyeccion":"true"}');
  assert.equal(r.posible_inyeccion, false);
});
