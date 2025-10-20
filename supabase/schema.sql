create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  created_at timestamptz default now()
);

create table if not exists content_queue (
  id uuid primary key default gen_random_uuid(),
  channel text check (channel in ('email','linkedin','instagram','youtube','spotify')),
  title text,
  body text,
  media_url text,
  scheduled_at timestamptz,
  status text default 'queued',
  meta jsonb,
  created_by uuid references users(id),
  created_at timestamptz default now()
);

create table if not exists event_log (
  id bigint generated always as identity primary key,
  ts timestamptz default now(),
  actor text,
  action text,
  entity text,
  payload jsonb
);

create table if not exists registry_item (
  id uuid primary key default gen_random_uuid(),
  source text,
  url text,
  title text,
  summary text,
  published_at timestamptz,
  hash text unique,
  raw jsonb,
  created_at timestamptz default now()
);
