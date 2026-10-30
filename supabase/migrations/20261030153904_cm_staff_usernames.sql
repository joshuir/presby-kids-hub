-- Sub-admins sign in with a username (login address <username>@staff.cm.invalid, created by the cm-staff function).
alter table kh_private.admins add column if not exists username text;
create unique index if not exists admins_username_key on kh_private.admins (username) where username is not null;
alter table kh_private.admins drop constraint if exists admins_username_check;
alter table kh_private.admins add constraint admins_username_check check (username is null or username ~ '^[a-z0-9][a-z0-9._-]{2,29}$');
-- kh_admins_list now returns username; kh_staff_save (create/update/rename, owner only); kh_staff_uid (owner only).
-- Full definitions are applied in the Supabase project (migration "cm_staff_usernames").
