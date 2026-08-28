import { test } from "node:test";
import assert from "node:assert/strict";
import { calcularCostoMxn, PRECIO_USD_POR_MILLON_INPUT, USD_A_MXN_APROX } from "./costo.ts";

test("1 millón de tokens de input cuesta el precio de input en USD, convertido a MXN", () => {
  const mxn = calcularCostoMxn(1_000_000, 0);
  assert.equal(mxn, PRECIO_USD_POR_MILLON_INPUT * USD_A_MXN_APROX);
});

test("0 tokens cuesta 0", () => {
  assert.equal(calcularCostoMxn(0, 0), 0);
});

test("output pesa 5x más que input por token (precio real de Haiku 4.5)", () => {
  const soloInput = calcularCostoMxn(1000, 0);
  const soloOutput = calcularCostoMxn(0, 1000);
  assert.ok(soloOutput > soloInput * 4);
});
