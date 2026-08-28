-- Commit 7: costo variable real por cotejo (packet, Superficie B) — se
-- calcula del consumo REAL de tokens de la API de visión, no se estima.
-- Ver src/lib/costo.ts.

alter table value_events
  add column if not exists costo_variable_mxn numeric;
