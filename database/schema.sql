-- Schema base para Biblioteca Virtual.
-- Ejecuta este archivo en Supabase SQL Editor antes de iniciar el backend.

create extension if not exists "pgcrypto";

create table if not exists public.usuarios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text not null unique,
  password_hash text not null,
  rol text not null default 'usuario' check (rol in ('usuario', 'admin', 'superadmin')),
  token_version integer not null default 0 check (token_version >= 0),
  password_changed_at timestamptz,
  reset_token text,                          -- Legacy: ya no se usa para nuevos resets
  reset_token_expires timestamptz,           -- Legacy: ya no se usa para nuevos resets
  created_at timestamptz not null default now()
);

alter table public.usuarios
  add column if not exists token_version integer not null default 0 check (token_version >= 0);

alter table public.usuarios
  add column if not exists password_changed_at timestamptz;

alter table public.usuarios
  add column if not exists reset_token text;

alter table public.usuarios
  add column if not exists reset_token_expires timestamptz;

alter table public.usuarios
  drop constraint if exists usuarios_rol_check;

alter table public.usuarios
  add constraint usuarios_rol_check check (rol in ('usuario', 'admin', 'superadmin'));

create table if not exists public.password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.usuarios(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  requested_ip text,
  requested_user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists idx_password_reset_tokens_usuario_id
  on public.password_reset_tokens (usuario_id);

create index if not exists idx_password_reset_tokens_lookup
  on public.password_reset_tokens (token_hash, consumed_at, expires_at);

create table if not exists public.auth_audit_logs (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references public.usuarios(id) on delete set null,
  event_type text not null,
  email text,
  ip_address text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_auth_audit_logs_usuario_id_created_at
  on public.auth_audit_logs (usuario_id, created_at desc);

create index if not exists idx_auth_audit_logs_event_created_at
  on public.auth_audit_logs (event_type, created_at desc);

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

alter table public.usuarios enable row level security;
alter table public.recursos enable row level security;
alter table public.password_reset_tokens enable row level security;
alter table public.auth_audit_logs enable row level security;
