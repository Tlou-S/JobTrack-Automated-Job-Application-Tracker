create table if not exists public.bulletin_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users (id) on delete cascade,
  author_name text not null,
  category text not null check (
    category in ('Announcement', 'Lost & Found', 'Study Group', 'Event')
  ),
  title text not null check (char_length(title) between 1 and 120),
  body text not null check (char_length(body) between 1 and 5000),
  image_paths text[] not null default '{}' check (cardinality(image_paths) <= 5),
  created_at timestamptz not null default now()
);

create or replace function public.prepare_bulletin_post()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.author_id <> auth.uid() then
    raise exception 'Post author must match the signed-in user.';
  end if;

  if exists (
    select 1
    from unnest(new.image_paths) as image(path)
    where image.path !~ ('^' || new.author_id::text || '/[^/]+$')
  ) then
    raise exception 'Post attachments must belong to the signed-in user.';
  end if;

  select coalesce(
    nullif(btrim(account.raw_user_meta_data ->> 'full_name'), ''),
    account.email,
    'UniTrade member'
  )
  into new.author_name
  from auth.users as account
  where account.id = new.author_id;

  if new.author_name is null then
    raise exception 'Could not find the signed-in post author.';
  end if;

  return new;
end;
$$;

drop trigger if exists prepare_bulletin_post on public.bulletin_posts;
create trigger prepare_bulletin_post
  before insert on public.bulletin_posts
  for each row execute function public.prepare_bulletin_post();

alter table public.bulletin_posts enable row level security;

grant select on public.bulletin_posts to anon, authenticated;
grant insert, delete on public.bulletin_posts to authenticated;

drop policy if exists "Anyone can read bulletin posts" on public.bulletin_posts;
create policy "Anyone can read bulletin posts"
  on public.bulletin_posts for select
  using (true);

drop policy if exists "Authors can create bulletin posts" on public.bulletin_posts;
create policy "Authors can create bulletin posts"
  on public.bulletin_posts for insert to authenticated
  with check (author_id = (select auth.uid()));

drop policy if exists "Authors can delete their bulletin posts" on public.bulletin_posts;
create policy "Authors can delete their bulletin posts"
  on public.bulletin_posts for delete to authenticated
  using (author_id = (select auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'bulletin-attachments',
  'bulletin-attachments',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anyone can view bulletin attachments" on storage.objects;
create policy "Anyone can view bulletin attachments"
  on storage.objects for select
  using (bucket_id = 'bulletin-attachments');

drop policy if exists "Users can upload their bulletin attachments" on storage.objects;
create policy "Users can upload their bulletin attachments"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'bulletin-attachments'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can delete their bulletin attachments" on storage.objects;
create policy "Users can delete their bulletin attachments"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'bulletin-attachments'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
