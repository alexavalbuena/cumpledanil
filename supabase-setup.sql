-- ============================================================
-- Script de configuración para el proyecto "Cielo de cumpleaños"
-- ============================================================
-- Cómo usarlo:
-- 1) Entra a tu proyecto en supabase.com
-- 2) Ve al menú lateral "SQL Editor" → "New query"
-- 3) Pega TODO este archivo y dale a "Run" (o el botón ▶)
-- Es seguro volver a ejecutarlo aunque ya lo hayas corrido antes
-- (no borra nada, solo crea lo que falte).
-- ============================================================

-- Tabla principal: una fila por cada estrella
-- (tipo puede ser 'mensaje', 'audio', 'video' o 'foto')
create table if not exists estrellas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  tipo text not null default 'mensaje',
  mensaje text,
  imagen_url text,
  audio_url text,
  video_url text,
  created_at timestamptz not null default now()
);

-- Por si la tabla ya existía de una versión anterior sin estas columnas:
alter table estrellas add column if not exists tipo text not null default 'mensaje';
alter table estrellas add column if not exists video_url text;
alter table estrellas alter column mensaje drop not null;

alter table estrellas add column if not exists email text;
alter table estrellas add column if not exists x numeric;
alter table estrellas add column if not exists y numeric;
alter table estrellas add column if not exists diseno smallint;

create index if not exists estrellas_email_idx on estrellas (lower(email));

-- Activamos seguridad a nivel de fila (Row Level Security)
alter table estrellas enable row level security;

-- Permitimos que cualquiera pueda LEER las estrellas (para que se
-- vean en el cielo)
drop policy if exists "Cualquiera puede leer las estrellas" on estrellas;
create policy "Cualquiera puede leer las estrellas"
on estrellas for select
to anon
using (true);

-- Permitimos que cualquiera pueda AGREGAR una estrella nueva
drop policy if exists "Cualquiera puede agregar una estrella" on estrellas;
create policy "Cualquiera puede agregar una estrella"
on estrellas for insert
to anon
with check (true);

drop view if exists estrellas_publicas;
create view estrellas_publicas
with (security_invoker = true)
as
select id, x, y, diseno, created_at
from estrellas;

grant select on estrellas_publicas to anon;

-- ============================================================
-- IMPORTANTE: Antes de ejecutar la parte de abajo, primero crea
-- los buckets de Storage desde la interfaz (no se puede hacer por
-- SQL). Ve a "Storage" en el menú lateral → "New bucket":
--   • Nombre: imagenes   → marca la opción "Public bucket"
--   • Nombre: audios     → marca la opción "Public bucket"
--   • Nombre: videos     → marca la opción "Public bucket"
-- Luego vuelve aquí y ejecuta lo siguiente para que cualquiera
-- pueda subir y ver los archivos de esos buckets.
-- ============================================================

drop policy if exists "Subir imagenes publico" on storage.objects;
create policy "Subir imagenes publico"
on storage.objects for insert
to anon
with check (bucket_id = 'imagenes');

drop policy if exists "Leer imagenes publico" on storage.objects;
create policy "Leer imagenes publico"
on storage.objects for select
to anon
using (bucket_id = 'imagenes');

drop policy if exists "Subir audios publico" on storage.objects;
create policy "Subir audios publico"
on storage.objects for insert
to anon
with check (bucket_id = 'audios');

drop policy if exists "Leer audios publico" on storage.objects;
create policy "Leer audios publico"
on storage.objects for select
to anon
using (bucket_id = 'audios');

drop policy if exists "Subir videos publico" on storage.objects;
create policy "Subir videos publico"
on storage.objects for insert
to anon
with check (bucket_id = 'videos');

drop policy if exists "Leer videos publico" on storage.objects;
create policy "Leer videos publico"
on storage.objects for select
to anon
using (bucket_id = 'videos');
