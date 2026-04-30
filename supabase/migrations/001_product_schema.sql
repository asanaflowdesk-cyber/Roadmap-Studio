-- Roadmap Studio product schema draft for Supabase/PostgreSQL.
-- This migration describes the database target for the React prototype.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  initials text,
  avatar_color text,
  platform_role text not null default 'user',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text,
  is_archived boolean not null default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  team_role text not null default 'member',
  created_at timestamptz not null default now(),
  unique(team_id, user_id)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  template_id uuid,
  title text not null,
  description text,
  status text not null default 'new',
  horizon text,
  start_date date,
  due_date date,
  owner_id uuid references public.profiles(id),
  is_archived boolean not null default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  project_role text not null default 'guest',
  created_at timestamptz not null default now(),
  unique(project_id, user_id)
);

create table if not exists public.phases (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  sort_order integer not null default 1,
  start_date date,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.roadmap_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  phase_id uuid references public.phases(id) on delete set null,
  item_type text not null default 'task',
  title text not null,
  result text,
  description text,
  status text not null default 'new',
  priority text default 'normal',
  owner_id uuid references public.profiles(id),
  start_date date,
  due_date date,
  is_archived boolean not null default false,
  sort_order integer not null default 1,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.roadmap_item_assignees (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.roadmap_items(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  unique(item_id, user_id)
);

create table if not exists public.subtasks (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.roadmap_items(id) on delete cascade,
  title text not null,
  due_date date,
  is_done boolean not null default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.roadmap_items(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_templates (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete set null,
  title text not null,
  description text,
  category text,
  visibility text not null default 'all',
  is_active boolean not null default true,
  is_archived boolean not null default false,
  version integer not null default 1,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.template_phases (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.project_templates(id) on delete cascade,
  title text not null,
  sort_order integer not null default 1,
  duration_days integer not null default 1
);

create table if not exists public.template_items (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.project_templates(id) on delete cascade,
  template_phase_id uuid references public.template_phases(id) on delete cascade,
  item_type text not null default 'task',
  title text not null,
  result text,
  description text,
  relative_start_day integer not null default 0,
  relative_due_day integer not null default 1,
  default_owner_role text default 'projectManager',
  priority text default 'normal',
  sort_order integer not null default 1
);

create table if not exists public.template_versions (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.project_templates(id) on delete cascade,
  version_number integer not null,
  snapshot_json jsonb not null default '{}'::jsonb,
  changed_by uuid references public.profiles(id),
  change_comment text,
  created_at timestamptz not null default now()
);

create table if not exists public.dictionaries (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  is_system boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dictionary_items (
  id uuid primary key default gen_random_uuid(),
  dictionary_id uuid not null references public.dictionaries(id) on delete cascade,
  code text not null,
  title text not null,
  sort_order integer not null default 1,
  color text,
  icon text,
  meta jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  unique(dictionary_id, code)
);

create table if not exists public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_scope text not null,
  role_code text not null,
  permission_code text not null,
  permission_value text not null default 'false',
  unique(role_scope, role_code, permission_code)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  entity_type text,
  entity_id uuid,
  event_code text not null,
  title text not null,
  message text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.notification_rules (
  id uuid primary key default gen_random_uuid(),
  event_code text not null unique,
  title text not null,
  is_active boolean not null default true,
  channels text[] not null default array['inApp'],
  target_roles text[] not null default array[]::text[],
  respect_project_visibility boolean not null default true,
  deadline_days integer
);

create table if not exists public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_code text not null,
  in_app_enabled boolean not null default true,
  email_enabled boolean not null default false,
  digest_enabled boolean not null default false,
  unique(user_id, event_code)
);

create table if not exists public.notification_delivery_log (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid references public.notifications(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  channel text not null,
  status text not null,
  error_message text,
  sent_at timestamptz not null default now()
);

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  file_name text not null,
  file_url text not null,
  file_type text,
  file_size bigint,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.task_dependencies (
  id uuid primary key default gen_random_uuid(),
  source_item_id uuid not null references public.roadmap_items(id) on delete cascade,
  target_item_id uuid not null references public.roadmap_items(id) on delete cascade,
  dependency_type text not null default 'finish_to_start'
);

create table if not exists public.approval_requests (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  requested_by uuid references public.profiles(id),
  approver_id uuid references public.profiles(id),
  status text not null default 'pending',
  comment text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.saved_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  view_type text not null,
  title text not null,
  filters jsonb not null default '{}'::jsonb,
  sorting jsonb not null default '{}'::jsonb,
  columns jsonb not null default '{}'::jsonb,
  is_default boolean not null default false
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.profiles(id),
  action text not null,
  entity_table text not null,
  entity_id uuid,
  team_id uuid,
  project_id uuid,
  old_data jsonb,
  new_data jsonb,
  changed_fields text[],
  user_agent text,
  created_at timestamptz not null default now()
);
