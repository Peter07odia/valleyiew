begin;
create table public.valleyview_chat_limits (
  fingerprint text primary key check (fingerprint ~ '^[a-f0-9]{64}$'),
  window_start timestamptz not null,
  attempts integer not null check (attempts > 0)
);
alter table public.valleyview_chat_limits enable row level security;
revoke all on public.valleyview_chat_limits from public, anon, authenticated, service_role;
create function public.claim_valleyview_chat_request(client_fingerprint text)
returns boolean language plpgsql security definer set search_path='' as $$
declare r public.valleyview_chat_limits;
begin
  if client_fingerprint is null or client_fingerprint !~ '^[a-f0-9]{64}$' then return false; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('vvm-chat-' || client_fingerprint,0));
  select * into r from public.valleyview_chat_limits where fingerprint=client_fingerprint;
  if found and r.window_start > now()-interval '1 hour' then
    if r.attempts >= 30 then return false; end if;
    update public.valleyview_chat_limits set attempts=attempts+1 where fingerprint=client_fingerprint;
  else
    insert into public.valleyview_chat_limits values(client_fingerprint,now(),1)
    on conflict(fingerprint) do update set window_start=now(),attempts=1;
  end if;
  delete from public.valleyview_chat_limits where window_start < now()-interval '1 day';
  return true;
end; $$;
revoke all on function public.claim_valleyview_chat_request(text) from public,anon,authenticated;
grant execute on function public.claim_valleyview_chat_request(text) to service_role;
commit;
