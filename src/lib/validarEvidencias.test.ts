import { test } from "node:test";
import assert from "node:assert/strict";
import { validarEvidencias, TAMANO_MAXIMO_BYTES } from "./validarEvidencias.ts";

test("acepta entre 2 y 4 archivos válidos", () => {
  const r = validarEvidencias([
    { nombre: "cotizacion.pdf", tipo: "application/pdf", tamanoBytes: 1000 },
    { nombre: "clabe.png", tipo: "image/png", tamanoBytes: 1000 },
  ]);
  assert.equal(r.ok, true);
  assert.equal(r.archivosValidos.length, 2);
});

test("rechaza menos de 2 archivos", () => {
  const r = validarEvidencias([{ nombre: "a.png", tipo: "image/png", tamanoBytes: 100 }]);
  assert.equal(r.ok, false);
  assert.match(r.errores[0], /al menos 2/);
});

test("rechaza más de 4 archivos", () => {
  const cinco = Array.from({ length: 5 }, (_, i) => ({
    nombre: `f${i}.png`,
    tipo: "image/png",
    tamanoBytes: 100,
  }));
  const r = validarEvidencias(cinco);
  assert.equal(r.ok, false);
  assert.match(r.errores[0], /Máximo 4/);
});

test("rechaza un tipo no permitido (Test #6 del packet)", () => {
  const r = validarEvidencias([
    { nombre: "virus.exe", tipo: "application/x-msdownload", tamanoBytes: 100 },
    { nombre: "ok.png", tipo: "image/png", tamanoBytes: 100 },
  ]);
  assert.equal(r.ok, false);
  assert.ok(r.errores.some((e) => e.includes("virus.exe")));
  assert.equal(r.archivosValidos.length, 1);
});

test("rechaza un archivo de 20MB con mensaje claro, sin crash (Test #6 del packet)", () => {
  const r = validarEvidencias([
    { nombre: "grande.png", tipo: "image/png", tamanoBytes: 20 * 1024 * 1024 },
    { nombre: "ok.pdf", tipo: "application/pdf", tamanoBytes: 100 },
  ]);
  assert.equal(r.ok, false);
  assert.ok(r.errores.some((e) => e.includes("grande.png") && e.includes("5MB")));
});

test("el límite es exactamente 5MB, inclusive", () => {
  const r = validarEvidencias([
    { nombre: "justo.png", tipo: "image/png", tamanoBytes: TAMANO_MAXIMO_BYTES },
    { nombre: "ok.pdf", tipo: "application/pdf", tamanoBytes: 100 },
  ]);
  assert.equal(r.ok, true);
});
