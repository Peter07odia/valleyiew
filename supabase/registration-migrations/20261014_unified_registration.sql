-- Additive, isolated seven-clinic intake. No existing table is altered.
begin;
create table public.valleyview_patient_registrations (
  id uuid primary key,
  created_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending','reviewed','contacted','closed')),
  preferred_location text not null check (preferred_location in ('whitby','oshawa','courtice','lansdowne-mall','peterborough-pharmacy','lynden-road','colborne-east')),
  first_name text not null check (length(first_name) between 1 and 100),
  last_name text not null check (length(last_name) between 1 and 100),
  email text not null check (length(email) between 3 and 254),
  phone text not null check (phone ~ '^1?[2-9][0-9]{9}$'),
  date_of_birth date not null check (date_of_birth >= '1900-01-01'),
  gender text not null check (gender in ('Female','Male','Non-binary / gender diverse','Another identity','Prefer not to say')),
  address text not null check (length(address) between 1 and 250),
  city text not null check (length(city) between 1 and 100),
  postal_code text not null check (length(postal_code) = 6),
  health_card_province text not null default 'ON' check (health_card_province in ('ON','AB','BC','MB','NB','NL','NS','NT','NU','PE','QC','SK','YT')),
  ohip_encrypted bytea not null check (octet_length(ohip_encrypted) between 36 and 40),
  conditions text not null check (length(conditions) between 1 and 4000),
  medications text not null check (length(medications) between 1 and 4000),
  comments text not null default '' check (length(comments) <= 4000),
  consent_version text not null check (consent_version = '2026-10-14'),
  consent_at timestamptz not null default now(),
  payload_hash text not null check (payload_hash ~ '^[a-f0-9]{64}$'),
  request_fingerprint text not null check (request_fingerprint ~ '^[a-f0-9]{64}$')
);
comment on table public.valleyview_patient_registrations is 'Seven-clinic registration requests only. No booking or patient enrollment is confirmed by submission.';
comment on column public.valleyview_patient_registrations.ohip_encrypted is 'AES-256-GCM: IV (12 bytes), tag (16 bytes), ciphertext. Unified registration key is server-only.';
create index valleyview_registration_email_created on public.valleyview_patient_registrations(email, created_at);
create index valleyview_registration_fingerprint_created on public.valleyview_patient_registrations(request_fingerprint, created_at);
alter table public.valleyview_patient_registrations enable row level security;
revoke all on public.valleyview_patient_registrations from public, anon, authenticated, service_role;
grant select, insert on public.valleyview_patient_registrations to service_role;

create or replace function public.submit_valleyview_registration(registration jsonb)
returns void language plpgsql security invoker set search_path = '' as $$
declare
  existing_hash text;
begin
  -- Serialize identical requests and rate-limit checks, including concurrent retries.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(registration->>'id', 0));
  select payload_hash into existing_hash from public.valleyview_patient_registrations
    where id = (registration->>'id')::uuid;
  if found then
    if existing_hash = registration->>'payload_hash' then return; end if;
    raise exception using errcode = 'P0002', message = 'Submission conflict';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(registration->>'request_fingerprint', 1));
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(registration->>'email', 2));
  if (select count(*) from public.valleyview_patient_registrations where email = registration->>'email' and created_at > now() - interval '1 day') >= 3
    or (select count(*) from public.valleyview_patient_registrations where request_fingerprint = registration->>'request_fingerprint' and created_at > now() - interval '1 hour') >= 10 then
    raise exception using errcode = 'P0001', message = 'Registration rate limit';
  end if;
  insert into public.valleyview_patient_registrations
    (id, preferred_location, first_name, last_name, email, phone, date_of_birth, gender,
     address, city, postal_code, ohip_encrypted, conditions, medications, comments,
     consent_version, payload_hash, request_fingerprint, health_card_province)
  values
    ((registration->>'id')::uuid, registration->>'preferred_location', registration->>'first_name',
     registration->>'last_name', registration->>'email', registration->>'phone', (registration->>'date_of_birth')::date,
     registration->>'gender', registration->>'address', registration->>'city', registration->>'postal_code',
     (registration->>'ohip_encrypted')::bytea, registration->>'conditions', registration->>'medications',
     registration->>'comments', registration->>'consent_version', registration->>'payload_hash', registration->>'request_fingerprint', coalesce(registration->>'health_card_province','ON'));
end;
$$;

revoke all on function public.submit_valleyview_registration(jsonb) from public,anon,authenticated;
grant execute on function public.submit_valleyview_registration(jsonb) to service_role;

create table public.valleyview_registration_notifications (
  registration_id uuid primary key references public.valleyview_patient_registrations(id) on delete cascade,
  created_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending','processing','sent')),
  attempts integer not null default 0,
  next_attempt_at timestamptz not null default now(),
  lease_token uuid,
  lease_expires_at timestamptz,
  sent_at timestamptz,
  email_id text
);
alter table public.valleyview_registration_notifications enable row level security;
revoke all on public.valleyview_registration_notifications from public, anon, authenticated, service_role;
grant select on public.valleyview_registration_notifications to service_role;
create index valleyview_notifications_pending on public.valleyview_registration_notifications(next_attempt_at) where status <> 'sent';

create function public.enqueue_valleyview_registration_notification()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  insert into public.valleyview_registration_notifications(registration_id) values(new.id) on conflict do nothing;
  return new;
end; $$;
revoke all on function public.enqueue_valleyview_registration_notification() from public,anon,authenticated;
create trigger valleyview_registration_notification_insert after insert on public.valleyview_patient_registrations
for each row execute function public.enqueue_valleyview_registration_notification();

create function public.claim_valleyview_registration_notifications(batch_size integer default 3)
returns table(registration_id uuid,lease_token uuid,preferred_location text)
language sql security definer set search_path='' as $$
  with ready as (
    select n.registration_id from public.valleyview_registration_notifications n
    where (n.status='pending' and n.next_attempt_at <= now())
       or (n.status='processing' and n.lease_expires_at < now())
    order by n.created_at limit greatest(1,least(batch_size,3)) for update skip locked
  )
  update public.valleyview_registration_notifications n
  set status='processing',attempts=n.attempts+1,lease_token=gen_random_uuid(),lease_expires_at=now()+interval '5 minutes'
  from ready where n.registration_id=ready.registration_id
  returning n.registration_id,n.lease_token,(select r.preferred_location from public.valleyview_patient_registrations r where r.id=n.registration_id);
$$;
revoke all on function public.claim_valleyview_registration_notifications(integer) from public,anon,authenticated;
grant execute on function public.claim_valleyview_registration_notifications(integer) to service_role;

create function public.finish_valleyview_registration_notification(job_id uuid,claim_token uuid,provider_id text default null)
returns boolean language plpgsql security definer set search_path='' as $$
begin
  update public.valleyview_registration_notifications n set
    status=case when provider_id is null then 'pending' else 'sent' end,
    sent_at=case when provider_id is null then null else now() end,
    email_id=provider_id,lease_token=null,lease_expires_at=null,
    next_attempt_at=now()+make_interval(secs => least(21600,60*power(2,least(n.attempts,8)))::integer)
  where n.registration_id=job_id and n.lease_token=claim_token and n.status='processing';
  return found;
end; $$;
revoke all on function public.finish_valleyview_registration_notification(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.finish_valleyview_registration_notification(uuid,uuid,text) to service_role;

create table public.valleyview_export_auth_limits (
 action text primary key check(action in ('send','verify')),
 window_start timestamptz not null,
 last_attempt timestamptz not null,
 attempts integer not null
);
alter table public.valleyview_export_auth_limits enable row level security;
revoke all on public.valleyview_export_auth_limits from public, anon, authenticated, service_role;
create function public.claim_valleyview_export_auth_attempt(kind text)
returns boolean language plpgsql security definer set search_path='' as $$
declare r public.valleyview_export_auth_limits; window_length interval; max_attempts integer; delay interval;
begin
 if kind not in ('send','verify') then return false; end if;
 window_length := case when kind='send' then interval '1 hour' else interval '15 minutes' end;
 max_attempts := case when kind='send' then 5 else 10 end;
 delay := case when kind='send' then interval '60 seconds' else interval '1 second' end;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('valleyview-export-'||kind,0));
 select * into r from public.valleyview_export_auth_limits where action=kind;
 if found and r.window_start > now()-window_length then
  if r.attempts >= max_attempts or r.last_attempt > now()-delay then return false; end if;
  update public.valleyview_export_auth_limits set attempts=attempts+1,last_attempt=now() where action=kind;
 else
  insert into public.valleyview_export_auth_limits values(kind,now(),now(),1)
  on conflict(action) do update set window_start=now(),last_attempt=now(),attempts=1;
 end if;
 return true;
end;
$$;
revoke all on function public.claim_valleyview_export_auth_attempt(text) from public,anon,authenticated;
grant execute on function public.claim_valleyview_export_auth_attempt(text) to service_role;

commit;
