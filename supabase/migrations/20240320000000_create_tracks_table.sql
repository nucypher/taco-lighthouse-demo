create table "public"."tracks" (
    "id" uuid not null default gen_random_uuid(),
    "owner_id" text,
    "ipfs_cid" text,
    "title" text not null,
    "description" text,
    "cover_art_cid" text,
    "created_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone default CURRENT_TIMESTAMP
);

alter table "public"."tracks" enable row level security;

create policy "Anyone can insert tracks"
on "public"."tracks"
as permissive
for insert
to public
with check (true);

create policy "Anyone can view tracks"
on "public"."tracks"
as permissive
for select
to public
using (true);

create policy "Users can delete their own tracks"
on "public"."tracks"
as permissive
for delete
to public
using (auth.uid() = owner_id);

create policy "Users can update their own tracks"
on "public"."tracks"
as permissive
for update
to public
using (auth.uid() = owner_id);