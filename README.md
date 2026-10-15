# Valleyview Medical Centre — unified website

Brantford's Next.js application, extended to seven clinics with its existing two-step registration workflow, the Peterborough chat interface, and the original website's physician carousel. Original source repositories and public domains are unchanged.

## Run and verify

```sh
npm ci
npm run dev
npm test
npm run typecheck
npm run lint
npm run build
```

The local workspace currently shares installed packages using a `node_modules` symlink. A fresh checkout/deployment installs from this project's lockfile normally.

## Content

- `src/data/locations.json`: seven clinics, stable legacy registration IDs, public slugs, Ocean booking destinations, confirmed hours and doctor assignments.
- `src/data/durham-doctors.json`: original public backup biographies and portraits.
- `src/data/regional-doctors.json`: current Brantford and Peterborough physician profiles.
- `src/components/team/team-carousel.module.css`: recovered original team appearance, responsive carousel.
- Registration uses stable IDs (`lynden-road`, `colborne-east`, `lansdowne-mall`) independently of public location URLs.
- Unknown hours remain unconfirmed. Do not infer individual physician acceptance from the open registration form.

## Registration activation

The user authorized registration for all seven clinics and `valleyviewlynden@gmail.com` as the interim central report recipient on 2026-10-14. `VVM_REPORT_RECIPIENTS_JSON` can later replace that fallback with clinic-specific email arrays. Omitted clinics have no recipient/access, and their submissions fail closed.

The backend targets ONLY clinic Supabase project `mdstlgpuzstyknmyfovc`. The connected generic Supabase MCP currently points at another project and must not be used for this migration.

1. Inspect the clinic schema using `supabase/verification/preflight.sql` through an authorized database connection. The normal CLI login helper currently fails with a database-role permission error.
2. Apply ONLY `supabase/registration-migrations/20261014_unified_registration.sql` and `20261014_chat_limits.sql`, once, through the authorized clinic SQL/migration interface. They create isolated new tables/functions; they do not alter existing Brantford, Peterborough, booking or phone tables.
3. Configure the server-only variables in `.env.example` in the Vercel production environment. Generate a fresh unified AES-256-GCM key; retain the original Brantford key separately if legacy export is enabled. Never print or commit keys.
4. New registrations use `valleyview_patient_registrations`; notifications use `valleyview_registration_notifications`. An optional legacy export reads only permitted Brantford clinic IDs from the old table and decrypts with its original key. No records are moved.
5. `VVM_INCLUDE_LEGACY_REPORTS=true` enables the old-record union. Configure the original `BRANTFORD_REGISTRATION_ENC_KEY` exactly; do not replace the old key. Leave false unless the legacy key and access have been verified.
6. Set `VVM_REPORTS_ENABLED=true`, authorized sending domain/mailbox, and `CRON_SECRET`. Vercel calls the notification route every five minutes using GET and bearer authentication. New and old notification queues are separate. Do not retire the old schedule before its queue has drained.
7. Verify with clearly synthetic submissions: seven clinic IDs, retry consistency, duplicate conflicts, protected access, clinic-specific XLSX and notification routing. Never query/export real records merely for testing. Remove only the explicitly created synthetic IDs/queue jobs after verification.

Vercel previews reject registrations regardless of secrets and the form is visibly labelled as a design preview. The review deployment is not a live intake channel.

## AI assistant

The Peterborough interface now uses the same seven-clinic registry as the site. Requests validate roles, message length, count and size; reject system/tool/file messages; bound model output; and enforce a durable 30-request/hour client limit. The chat has no record lookup or booking tools. It is hidden on intake and staff routes. No conversation content is persisted by application code. Provider/hosting retention remains governed by their configuration and agreements.

Configure Gemini and the dedicated rate-limit secret only after applying `20261014_chat_limits.sql`. Without those dependencies the API returns a safe unavailable response. It is not verified against the paid model in this preview.

## Vercel and domain transition

`vercel.json` targets Montréal functions (`yul1`, Vercel's Canadian region) and the protected notification cron. This is not a guarantee that all providers/data reside in Canada; the existing clinic database was observed in `us-east-1`. No provider region was changed.

Keep the main domain registered at GoDaddy. A later, explicitly approved production cutover can point website DNS to Vercel. Preserve email records and verify the separate `admin` dependency before retiring old hosting. Regional domains should redirect to their corresponding location/region routes. The current regional sites remain online.

## Verification status

See `docs/VERIFICATION-2026-10-14.md` for actual results and remaining activation requirements. See `docs/IMPLEMENTATION-PLAN.md` for the plan written before implementation.
