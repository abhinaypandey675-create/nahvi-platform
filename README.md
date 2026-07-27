# NAHVI platform

Full-stack rebuild of the NAHVI landing page: dynamic app catalog, admin
dashboard, email/password + Google/GitHub auth, and admin email
notifications on every event you asked for (registrations, logins, project
requests, contact form, app requests, payments, production errors).

**Important:** this was written in a sandbox with no network access, so
nothing here has been run, installed, or deployed yet. Follow the steps
below in order — each one unblocks the next.

## 1. Install

```bash
npm install
```

## 2. Set up the database (Postgres)

Easiest free option: [neon.tech](https://neon.tech) — create a project,
copy the pooled connection string.

```bash
cp .env.example .env
# paste the connection string into DATABASE_URL in .env
npx prisma db push
npm run db:seed
```

The seed script creates:
- An admin account: `abhinaypandey675@gmail.com` / `ChangeMe123!` — **change
  this password immediately after your first login** at `/admin/login`.
- The three real apps from your original site (ResumeAI, Voice Agent Suite,
  LLM Agent Framework).

## 3. Generate the auth secret

```bash
openssl rand -base64 32
```
Paste the result into `NEXTAUTH_SECRET` in `.env`.

## 4. Google Sign-In

1. [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Create OAuth client ID → Web application
3. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
   (and your production URL + same path once deployed)
4. Copy Client ID/Secret into `.env`

## 5. GitHub Sign-In

1. [GitHub → Settings → Developer settings → OAuth Apps → New](https://github.com/settings/developers)
2. Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
3. Copy Client ID/Secret into `.env`

## 6. Email (Resend)

1. [resend.com](https://resend.com) → API Keys → create one
2. For real delivery, verify a sending domain. For quick testing, you can
   send from `onboarding@resend.dev` without domain verification (that's
   the default in `.env.example`).
3. Paste the API key into `RESEND_API_KEY`.

`ADMIN_NOTIFY_EMAIL` is already set to `abhinaypandey675@gmail.com` — every
event listed in the brief (new user, login, project request, contact form,
app request, payment, production error) emails that address. See
`lib/email.ts` for all the templates.

## 7. Rate limiting (recommended before real traffic)

The app works without this (falls back to in-memory limiting), but that
fallback doesn't work correctly on serverless multi-instance hosts like
Vercel. Set up [upstash.com](https://upstash.com) (free tier) and paste the
REST URL/token into `.env` before you rely on rate limiting in production.

## 8. Run locally

```bash
npm run dev
```

Visit `http://localhost:3000`. Sign in at `/admin/login` with the seeded
admin account to manage apps at `/admin/apps`.

## 9. Deploy

Any of these work — the app has no host-specific code:

- **Vercel**: import the repo, set all `.env` values as environment
  variables, deploy. Set `NEXTAUTH_URL` to your production URL and update
  the OAuth redirect URIs (steps 4/5) to match.
- **Railway / Render**: same idea — provision as a Node web service, set
  env vars, `npm run build && npm start`.

## What's built vs. what's stubbed

**Fully wired:** auth (credentials + Google + GitHub), email verification,
forgot/reset password, dynamic app catalog + detail pages, admin CRUD for
apps (publish/feature/delete), admin dashboard with real stats and recent
activity, contact form, project-request form, careers application form,
all seven admin email notifications, rate limiting, CSRF (handled by
NextAuth's built-in double-submit cookie), SEO (sitemap/robots/OpenGraph),
reduced-motion support.

**Scaffolded but minimal — extend as needed:**
- Blog: schema + listing/detail pages exist; there's no admin UI to write
  posts yet (use `prisma studio` — `npm run db:studio` — to add rows for now).
- Testimonials, FAQs: schema exists, no rendering/admin UI wired up yet.
- Payment notifications: `notify.paymentCompleted()` exists in
  `lib/email.ts` — call it from wherever you integrate a payment provider
  (Stripe, Razorpay, etc.) once you pick one.
- Command palette (Ctrl+K), image/video upload UI, drag-to-reorder apps,
  light/dark/system theme toggle: not built yet — say the word and I'll add
  whichever of these you want next.

## Security notes

- Passwords are hashed with bcrypt (cost 12) and never logged or emailed.
- All mutation endpoints (`POST`/`PUT`/`DELETE` on apps, admin summary)
  check for an authenticated session with `role: ADMIN` via
  `middleware.ts` and per-route checks.
- Public write endpoints (register, contact, requests, careers) are
  rate-limited per IP.
- Email verification is required before a credentials account can sign in.
