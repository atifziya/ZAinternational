# ZA International Tours & Travels

A React, TypeScript and Vite platform for ZA International Tours & Travels. It preserves the legacy site’s confirmed company, contact, map, translated home-page, testimonial, service, and Umrah-package information while providing a modern public experience and a secure Firebase-backed content workspace.

## Current status

The source application, public design, routes, local legacy-content fallback, Firebase client integration, administrator UI, security rules, callable enquiry intake, migration tooling, and deployment configuration are complete in this repository. No Firebase project, rules, Function, App Check configuration, user account, or hosting deployment was changed automatically.

`_legacy_source_2026-10-24/` is a recoverable copy of the original static site made before migration. It contains the original HTML, CSS, JavaScript and supplied images. The original source directories are also still present; the Vite build only deploys the new application and the `public/` assets.

## Commands

```powershell
npm install
npm run dev
npm run typecheck
npm run lint
npm run build
npm run preview
```

For Cloud Functions:

```powershell
npm --prefix functions install
npm --prefix functions run build
```

## Firebase configuration

1. Copy `.env.example` to `.env.local` and fill in the Firebase **web-app configuration** values for the existing ZA project. These values identify a browser client; do not put service-account keys, SMTP passwords, or other privileged credentials in this file.
2. In Firebase Console, enable **Email/Password** Authentication and create the first administrator’s authentication user. There is intentionally no public administrator registration.
3. Install the Firebase CLI, authenticate to the intended Firebase project, and verify its project ID before deploying any configuration.
4. Enable and configure Firebase App Check for the production web app. The public enquiry function rejects requests without a valid App Check token.
5. Create the Function secret from a trusted terminal:

```powershell
firebase functions:secrets:set ENQUIRY_RATE_LIMIT_SALT
```

6. In a trusted environment that has Application Default Credentials for the **correct** project, assign the server-side custom claim:

```powershell
npm --prefix functions install
npm --prefix functions run set-admin -- administrator@example.com
```

The administrator must sign out and sign back in after the claim is assigned. The UI checks this claim for usability; `firestore.rules` and `storage.rules` enforce it at the backend as well.

## Firestore model and security

| Collection | Access model | Purpose |
|---|---|---|
| `packages` | Public read: `published` only; admin write | Hajj and Umrah listings |
| `jobs` | Public read: `published` only; admin write | Overseas vacancies |
| `enquiries` | Admin only | Private visitor enquiries created by a Function |
| `siteSettings/public` | Public read; admin write | Contact and map details |
| `media` / Storage `media/` | Public image read; admin write | Public package assets |
| `adminActivity` | Admin only | Optional audit records |

`firestore.rules` has no unrestricted read or write rule. Direct public writes to `enquiries` are denied. `functions/src/index.ts` uses App Check, validates its input, limits a salted daily request fingerprint to five enquiries, and writes via the Admin SDK. The resulting rate-limit records are not readable from the client.

## Legacy migration

The original website has three Umrah cards but no Firestore data, actual Hajj package details, or job listings. The app keeps those three original Umrah listings available locally while Firebase is not yet configured. It marks them as enquiry-only because their dates have no year and the project cannot verify current availability.

The idempotent package migration is dry-run by default:

```powershell
npm --prefix functions run migrate:legacy
```

After reviewing the printed records and confirming the Firebase project, apply it:

```powershell
npm --prefix functions run migrate:legacy -- --apply
```

It merges the stable IDs below and never deletes or overwrites unrelated documents:

- `legacy-umrah-20-day`
- `legacy-umrah-18-day`
- `legacy-umrah-18-day-alt`

Before production migration, export or back up the target Firestore project, take a dry-run report, and verify the current rules. Do not migrate the old Realtime Database callback records into public Firestore; they contain private enquiries and should be handled separately under an approved retention/migration process.

## Deploy safely

```powershell
npm run build
firebase use YOUR_PROJECT_ID
firebase deploy --only firestore:rules,storage,functions,hosting
```

Run the commands only after inspecting `firebase use`, the Firestore/Storage rules impact, the Functions secret, billing requirements, Authentication authorized domains, App Check, and Hosting target. `firebase.json` rewrites React routes to `index.html` so direct navigation works. Change the sitemap/robots canonical domain if the production site will not be `zainternational.co.in`.

## Content workflow

1. Sign in through `/admin/login` with a custom-claim administrator account.
2. Add or update package/job content; select Draft, Published, Closed, or Archived.
3. Published packages and jobs become readable to public visitors. Closed and archived jobs do not remain publicly listed as active roles.
4. Use the Media Library for public JPEG, PNG, or WebP images under 5 MB. Before removal, verify a file is not used by a published package—Storage cannot infer all content references.
5. View private enquiries, update status, and add internal notes. Do not place confidential details in public package or job documents.

## Accessibility and SEO

The public app includes semantic landmarks, keyboard-visible focus styles, a skip link, labelled form controls, restrained motion with `prefers-reduced-motion`, responsive navigation, lazy-loaded package imagery, route-specific titles/descriptions, `robots.txt`, a sitemap, and a polished unknown-route page. The language control preserves English, Hindi, and Urdu home-page content, stores the preference, and switches RTL direction for Urdu. The legacy package information remains English where a verified translation does not exist.

## Deliberate limitations / configuration still required

- Firebase public configuration, Firestore data, Authentication accounts/claims, Functions deployment, App Check, and Hosting deployment remain intentionally unmodified.
- The migration provides existing Umrah listings only. No Hajj package details or real job records existed in the supplied project, so none were invented.
- The existing Realtime Database form accepted public writes. The new app does not reuse that unsafe pattern; it requires the secured callable Function to handle new enquiries.
- Current social links were placeholders in the legacy site, so the redesigned footer does not invent social profiles.
- Dynamic package/job sitemap entries need a trusted deployment-time sitemap generator if SEO coverage for newly published documents is required.
