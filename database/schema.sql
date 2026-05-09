-- Schema base para Biblioteca Virtual.
-- Ejecuta este archivo en Supabase SQL Editor antes de iniciar el backend.

create extension if not exists "pgcrypto";

create table if not exists public.usuarios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text not null unique,
  password_hash text not null,
  rol text not null default 'usuario' check (rol in ('usuario', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.recursos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text not null,
  categoria text not null,
  tags text[] not null default '{}',
  archivo_url text not null,
  archivo_nombre text not null,
  archivo_tipo text not null,
  "archivo_tamaño" bigint not null default 0,
  usuario_id uuid not null references public.usuarios(id) on delete cascade,
  descargas integer not null default 0 check (descargas >= 0),
  aprobado boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_recursos_aprobado_created_at
  on public.recursos (aprobado, created_at desc);

create index if not exists idx_recursos_categoria
  on public.recursos (categoria);

create index if not exists idx_recursos_descargas
  on public.recursos (descargas desc);

create index if not exists idx_recursos_usuario_id
  on public.recursos (usuario_id);
