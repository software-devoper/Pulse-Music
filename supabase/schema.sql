-- Enable UUID helper
create extension if not exists "pgcrypto";

create table if not exists public.playlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.playlist_tracks (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  track_id text not null,
  track_name text not null,
  artist_name text,
  track_image text,
  audio_url text,
  duration integer default 0,
  created_at timestamptz not null default now(),
  unique (playlist_id, track_id)
);

alter table public.playlists enable row level security;
alter table public.playlist_tracks enable row level security;

-- Users can manage only their own playlists.
create policy "playlists_select_own"
  on public.playlists for select
  using (auth.uid() = user_id);

create policy "playlists_insert_own"
  on public.playlists for insert
  with check (auth.uid() = user_id);

create policy "playlists_update_own"
  on public.playlists for update
  using (auth.uid() = user_id);

create policy "playlists_delete_own"
  on public.playlists for delete
  using (auth.uid() = user_id);

-- Track access follows playlist ownership.
create policy "tracks_select_own"
  on public.playlist_tracks for select
  using (
    exists (
      select 1 from public.playlists p
      where p.id = playlist_id and p.user_id = auth.uid()
    )
  );

create policy "tracks_insert_own"
  on public.playlist_tracks for insert
  with check (
    exists (
      select 1 from public.playlists p
      where p.id = playlist_id and p.user_id = auth.uid()
    )
  );

create policy "tracks_delete_own"
  on public.playlist_tracks for delete
  using (
    exists (
      select 1 from public.playlists p
      where p.id = playlist_id and p.user_id = auth.uid()
    )
  );
