# Verification — 2026-10-14

Local verification of the unified seven-clinic site against `docs/IMPLEMENTATION-PLAN.md`. Nothing was deployed, no migration was applied, and no production credentials, DNS, email or AWS resources were touched.

## Results

| Check | Result |
|---|---|
| `npm run typecheck` | Clean |
| `npm run lint` | Clean |
| `npm test` | 13 files, 100 tests pass |
| `npm run build` (Webpack) | Pass, 73 routes |
| Browser checks (production server, system Chrome, 1366×900 and 390×844) | 67/67 pass |

### Unit/API coverage added this pass

- Notification routing: each registration emails only the recipients approved for its clinic; a clinic with no recipients fails closed with no send; the email has a sign-in link and no patient details; idempotency keys are per recipient (`email.test.ts`).
- Cron: the GET route Vercel cron uses rejects missing, wrong and non-bearer secrets, and processes the queue with the correct bearer secret (`notifications.test.ts`).
- Report scope: Whitby-only staff query only `whitby` in the unified table, never the legacy table, and receive a single Whitby tab. Brantford staff with legacy reports enabled get their own clinic from both tables. Unlisted accounts are refused (`reports.test.ts`).

### Browser checks performed

For each of the 7 clinics: the header selector changes the Book link to that clinic's Ocean URL and filters the team carousel to exactly its doctors. Other checks:

- The carousel shows all 16 physicians before a clinic is selected.
- The selected clinic persists after a reload.
- Carousel controls: Previous is disabled at the start and Next scrolls.
- Profile pages render the source biography.
- `/new-patient-form?clinic=courtice` preselects the clinic. The form moves to step 2, and the submit button is disabled in preview mode.
- Chat is hidden on the intake page. It opens and closes. When the provider is unavailable, it shows the selected clinic's phone number and a link to Locations.
- The mobile chat sheet fills the viewport.
- No page has horizontal overflow, and no page throws a runtime error.
- Legacy redirects resolve.

## Changes made in this pass

- Chat failure now offers the selected clinic's `tel:` link and a Locations link, as plan step 6 requires. "Valley View" was renamed to "Valleyview".
- Mobile chat sheet is now full height. A variant class had been overriding `h-[100dvh]`, so long conversations could grow past the top of the screen.
- Legacy Brantford rows are queried only when the signed-in user holds Lynden Road or Colborne access. Before, the table was queried for every user and only the clinic filter kept other clinics' rows out.
- Branch-only copy has been rewritten. This covers the blog article body, the booking/staff gate messages, admin labels, the booking email header and file comments.
- Nine unused Brantford home and navigation components that carried "two Brantford locations" copy were removed.
- Added redirects for the original site paths: `/locations/brantford-1`, `/locations/peterborough-1`, `/staff/hetal-bhalala`, two blog posts, and seven retired service slugs.
- `/new-patient-form` is no longer in the sitemap, because the page is `noindex`.

## Not verified / still required before launch

- **Production backend:** the two migrations in `supabase/registration-migrations/` have not been applied. Apply them only through an authorized connection to `mdstlgpuzstyknmyfovc`, after running `supabase/verification/preflight.sql`.
- **Gemini:** never called. Chat was only exercised on its failure path.
- **End-to-end registration:** acceptance, notification email and XLSX download must be checked with explicitly synthetic records after production secrets and recipients are configured. Remove those records afterwards.
- **Per-clinic recipients:** `valleyviewlynden@gmail.com` is the interim central recipient for all seven clinics. Replace it with `VVM_REPORT_RECIPIENTS_JSON` once the clinic mailboxes are confirmed.
- **Report sign-in rate limits:** these are global, not per user, and were carried over from Brantford. Once several clinics' staff sign in, one person's attempts can delay another's (5 codes/hour, 10 verifications per 15 minutes).
- **Original pages without a destination:** `/accessibility` and `/terms-of-service` currently return 404. Their content needs a decision.
- **Missing hours:** Peterborough hours and Durham weekend hours remain "Call for hours".
- **Peterborough portraits:** Dr. Odusan and Dr. Oghotuoma have no portraits; the logo is shown instead.
- **Preview deployment:** none was made in this pass.
