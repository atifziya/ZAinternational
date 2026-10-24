# Migration audit and feature map

Audit completed on 24 October 2026 before source replacement. The supplied repository did not include Git history, a package manager manifest, Firestore rules, Storage rules, Firebase Functions, or a server-side administrator process. A recoverable snapshot is at `../_legacy_source_2026-10-24/`.

| Legacy asset or behavior | Finding | New implementation |
|---|---|---|
| `index.html` | English home page, visual slider, callback form | Responsive React home page, structured local content fallback, secured enquiry workflow |
| `hindi/index.html` | Hindi-translated home content | Hindi UI/home copy preserved via i18next |
| `urdu/index.html` | Urdu-translated home content and RTL direction | Urdu UI/home copy and RTL document direction |
| `umrah/index.html` | Three original package cards with ₹123,999/₹121,999 legacy prices, flight and inclusion details | Typed `Package` records, public cards and detail pages, stable migration IDs, enquiry-only status |
| `packages/index.html` | Hajj/Umrah category selection | `/packages`, `/umrah`, `/hajj` routes; no Hajj data invented |
| `careers/index.html` | Explicit “Job updates will be posted soon”; no records | Searchable/filterable jobs portal with correct empty state and admin publishing workflow |
| `services/index.html` | Six service categories | Typed central service data reused on home and services page |
| `pilgrimage/index.html` | Six historical testimonials | `/pilgrimage` historical-testimonials page; no nonexistent profile photos used |
| `contact/index.html` | Office, people, phones, email, map, Realtime Database form and WhatsApp redirect | Accessible contact page, preserved confirmed details/map, callable Firestore enquiry workflow, direct WhatsApp shortcut |
| `privacy/index.html` | Legacy privacy wording | Updated privacy route that accurately reflects the new enquiry flow |
| Firebase config in two HTML files | Browser public config and public Realtime Database writes | Vite public config environment interface; no config value reprinted; Firestore/Functions design with server-owned admin authorization |
| `images/` | Logo, 5 travel images, 3 package images | Copied into `public/images/` for the Vite build; originals retained |

## New route map

`/`, `/about`, `/hajj`, `/umrah`, `/packages`, `/packages/:slug`, `/jobs`, `/jobs/:slug`, `/services`, `/contact`, `/faq`, `/pilgrimage`, `/privacy-policy`, `/terms`, `/admin/login`, `/admin`, `/admin/packages`, `/admin/jobs`, `/admin/enquiries`, `/admin/media`, `/admin/settings`.

## Implementation checklist

- [x] Snapshot original project before changing the entry point.
- [x] Convert to Vite, React, TypeScript, React Router, reusable UI and typed content.
- [x] Preserve original text, office contacts, maps, logo, visual assets, package information, language options, testimonials, and service categories.
- [x] Build responsive public pages, filtering, enquiry flow, empty states, 404, accessibility support, and basic SEO assets.
- [x] Build restricted administrator routes and usable package/job/enquiry/media/settings modules.
- [x] Add Firestore/Storage rules, App-Check-enforced Function, rate limit, migration script, administrator-claim script, Hosting rewrite, and implementation documentation.
- [ ] Configure Firebase project and web environment values.
- [ ] Review/deploy rules, Functions, App Check, first-admin custom claim, data migration, and Hosting after user approval.
- [ ] Run Emulator Suite authorization tests after Firebase credentials and emulator tooling are configured.
