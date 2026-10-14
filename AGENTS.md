# Unified Valleyview Medical Centre

Read `docs/IMPLEMENTATION-PLAN.md` before changing this project. User authorized a unified seven-clinic website, all-clinic registration, Peterborough chat and the exact original team carousel. Temporary approved central report recipient: valleyviewlynden@gmail.com. Individual official clinic mailboxes will follow.

This is an isolated copy of the Brantford application. Existing regional repositories and deployments are not modified. Public clinic facts live in `src/data/locations.json`; original Durham biographies/photos were recovered from the public static backup. Do not copy backup credentials, email, control-panel or patient data.

New intake uses isolated `valleyview_patient_registrations` and a separate notification queue. Preserve all existing Brantford and Peterborough records. Never apply the legacy booking migrations. Only reviewed migrations under this project's `supabase/registration-migrations` apply. Never expose encryption or provider keys.

Custom booking/staff APIs and phone integration stay disabled; Ocean booking stays clinic-specific. Chat has public clinic information only and no patient-record tools.

Read installed `node_modules/next/dist/docs` for changed Next.js APIs. Run tests, typecheck, lint and production build before deployment. Preview must not be assumed ready for real patient submissions. See README for activation requirements.
