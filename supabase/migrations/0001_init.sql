create extension if not exists "pgcrypto";

create table checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  campos jsonb not null,          -- { "razon_social": { "estado": "coincide", "valores": [...] }, ... }
  n_evidencias integer not null,
  creado_en timestamptz default now()
);

create table value_events (
  id uuid primary key default gen_random_uuid(),
  monto_mxn numeric,                          -- monto del anticipo declarado por el usuario, si lo dio
  tiempo_segundos integer not null,
  n_evidencias integer not null,
  distribucion jsonb not null,                -- { "coincide": 2, "contradice": 1, "sin_evidencia": 2 }
  accion text not null check (accion in ('pague','pedi_mas_evidencia','pague_distinto','no_pague')),
  disposicion_pago text check (disposicion_pago in ('gratis','menos_de_50','50_a_200','mas_de_200')),
  creado_en timestamptz default now()
);

create table delivery_models (
  id text primary key,               -- 'producto' | 'feature' | 'infraestructura'
  nombre text not null,
  descripcion text not null,
  condicion_viabilidad text not null,
  metrica_que_lo_sostiene text not null
);

alter table checks enable row level security;
create policy "usuario ve solo sus cotejos"
  on checks for select using (auth.uid() = user_id);
create policy "usuario guarda sus propios cotejos"
  on checks for insert with check (auth.uid() = user_id);

-- value_events: SIN policy de insert para authenticated/anon — solo se escribe desde
-- el server action con la service role key (que ignora RLS). Lectura pública porque
-- no contiene ningún dato identificable de la contraparte ni del pagador.
alter table value_events enable row level security;
create policy "tablero de valor es publico"
  on value_events for select using (true);

alter table delivery_models enable row level security;
create policy "modelos de entrega son publicos"
  on delivery_models for select using (true);

insert into delivery_models (id, nombre, descripcion, condicion_viabilidad, metrica_que_lo_sostiene) values
('producto', 'Producto independiente', 'App standalone, cotejo.app', 'Disposición a pagar declarada suficiente para cubrir el costo variable por cotejo', 'Disposición a pagar declarada + costo variable real'),
('feature', 'Feature dentro de un banco o sistema de facturación', 'Se integra a algo que el usuario ya usa', 'Un banco o ERP la adopta como feature retenido, no como upsell', 'Tasa de cambio de acción — si mueve la aguja, es defendible como feature'),
('infraestructura', 'Infraestructura sobre el riel de pagos', 'Corre antes de cada SPEI, a nivel riel', 'Requiere mandato regulatorio o convenio — fuera de lo que este slice controla', 'Pérdida esperada evitada acumulada, a escala');
