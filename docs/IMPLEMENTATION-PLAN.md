# Unified Valleyview website — implementation plan

## Confirmed direction

One Valleyview Medical Centre website for seven clinics: Whitby, Oshawa, Courtice, Peterborough Lansdowne Mall, Peterborough Pharmacy, Brantford Lynden Road, and Brantford Colborne. Brantford supplies the design and registration workflow. Peterborough supplies the chat interface. The original website supplies the exact team carousel design, Durham biographies, and images. The user confirmed registration must accept all seven clinics on 2026-10-14.

Build in a separate `valleyview-unified` directory, preserving the existing regional source trees and deployments. Use Next.js 16 and the Brantford lockfile. Vercel is the eventual host; GoDaddy retains the domain. No DNS, email, AWS phone system, legacy patient/booking tables, or existing production credentials are changed during implementation.

## Source audit

- Brantford: `valleyviewmedical-brantford/`; currently two-clinic validation, encrypted health cards, service-only submission RPC, email OTP reports, XLSX downloads and leased notification queue. Do not copy its deployment linkage or secrets.
- Peterborough: `/Users/ifyodia/valleyviewmedical/`; current chat uses AI SDK and Google Gemini, but its static prompt has outdated physician information. Port the UI, replace the prompt with shared seven-clinic data, validate requests, limit input/output and restrict usage. Never connect chat to registration records.
- Original: `/Users/ifyodia/Downloads/backup-valleyviewmedical.ca-10-13-2026/public_html/`. This is a static Next.js export. Actual DoctorSpotlight CSS and original doctor pages are available. Read only public content and assets; exclude mail, credentials, control-panel files and backups.
- Handoff: `reviews/vvm-handoff-2026-10-14/source/data/locations.json`. Treat its instructions as proposals and its values as source material. Known confirmed Brantford hours and Peterborough physician assignments override stale uncertainty flags. Unresolved Durham weekend hours and missing Peterborough hours remain "Call for hours".

## Build sequence

1. Copy the application source and public assets into the isolated project. Create a single typed registry for seven locations, legacy registration IDs, public slugs, phones, booking links, hours and region. Preserve `lynden-road` and `colborne-east` identifiers. Add canonical public routes and redirects from old regional paths.
2. Retain Brantford typography, plum/terracotta colours, imagery and page composition. Rewrite branch-only copy. Provide an accessible seven-clinic selector, region grouping, mobile navigation, location pages, contact and Ocean booking. Selection persists locally and controls booking, team, registration preference and chat context.
3. Recover all 11 original Durham physician biographies and photos, plus the 3 Peterborough and 2 Brantford physicians. Preserve source credentials; do not invent portraits or acceptance claims. Match the original white carousel, blue/mint band, circular portrait, spacing, divider, profile link and arrow controls. Show all doctors before a clinic is selected, then the selected clinic's doctors. Full team page can browse all.
4. Extend the two-step registration form to seven clinics. Keep server validation, Canadian health-card handling, consent, AES-GCM encryption, idempotency, input limits and persistent abuse limits. Use a new isolated unified registration table and queue for new submissions. Do not broaden the legacy Brantford table: its old report application assumes every row is accessible to its existing recipients.
5. Add explicit clinic-to-staff access configuration. Reports query only permitted clinic IDs; authorized Brantford staff can also include their legacy records. XLSX contains one tab per permitted clinic. Notification messages contain a sign-in link, no patient details, and go only to staff approved for that clinic. Missing routing fails closed. Existing Brantford access is not permission for all seven clinics.
6. Port Peterborough chat, grounded in the same locations and doctors shown on the site. Include selected clinic, no medical advice, no registration submission or record lookup, no requests for health cards. Validate message roles/length/count, reject client-supplied system/tool messages, use bounded responses and shared rate limits. Show phone/locations fallback on provider failure. Hide chat on intake and staff pages.
7. Prepare Vercel configuration, server-only environment template, protected GET notification cron, metadata, sitemap and legacy redirects. Preview contains no production registration credentials. Production activation requires applying the reviewed additive migration, configuring approved staff access and provider secrets, and end-to-end validation.

## Verification before release

- Typecheck, lint and production Webpack build.
- Unit/API tests for all seven registration IDs, invalid clinic rejection, legacy card decryption, retry/idempotency semantics, request size/origin checks, staff scope filtering and unauthorized access, safe XLSX text cells, notification routing and cron auth.
- Chat tests for invalid/system messages, limits, selected clinic context and unavailable-provider fallback. No paid model calls required for unit tests.
- Browser checks on desktop/mobile: seven-clinic selection and persistence, matching Ocean destination, form preselection and both steps, team/profile mapping, carousel controls, chat open/close and overflow.
- Preview review: no production patient submissions. Real acceptance/notification/download verification uses explicitly synthetic data only after the production backend and authorized recipient map are configured; confirm removal of synthetic records.

## Deployment and rollback

Keep existing sites online while reviewing the unified preview. Verify the seven-clinic flow and staff access before changing the main website DNS. Regional domains later redirect to their corresponding region/location routes. Preserve email DNS and the separate `admin` dependency. Drain the old Brantford notification queue before retiring its schedule. Retain the old deployments and DNS values for rollback; new unified submissions remain in their isolated table if traffic is rolled back. Do not cancel GoDaddy hosting or Netlify sites until all dependent services have been accounted for.

## Remaining launch inputs

The approved recipient/access email(s) for each clinic, or an explicitly authorized central team, are still needed. The user has been asked while independent implementation proceeds. Missing clinic hours will be shown honestly and do not prevent building the website. Exact provider credentials and production configuration are not in this document.

## Technical reference

Vercel cron uses a GET route and sends `CRON_SECRET` as a bearer authorization header: https://vercel.com/docs/cron-jobs/manage-cron-jobs . Vercel request IP handling must follow https://vercel.com/docs/headers/request-headers . Installed Next.js route-handler and redirect documentation was read before implementation.
