import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

const apply = process.argv.includes('--apply');
const app = initializeApp({ credential: applicationDefault() });
const db = getFirestore(app);

const packages = [
  { id: 'legacy-umrah-20-day', slug: 'shaban-ramdan-deluxe-20-days', title: 'Shaban + Ramdan Deluxe Umrah Package', category: 'umrah', shortDescription: 'A 20-day legacy Umrah itinerary with direct Delhi–Jeddah travel information.', description: 'Migrated from the legacy ZA International website. Enquire to confirm all current travel information.', featuredImage: '/images/umrah1.png', gallery: ['/images/umrah1.png'], duration: '20 days', itinerary: ['07 Feb: Delhi (DEL) to Jeddah (JED)', '27 Feb: Jeddah (JED) to Delhi (DEL)', 'Direct flight: Indigo Airlines'], inclusions: ['Umrah Visa & Insurance', 'Complete Umrah Kit', '3 Times Meal Buffet', 'Weekly Laundry Service', '5 Litre Zamzam'], exclusions: ['Please confirm all current inclusions and exclusions with the team before travel.'], price: 123999, priceLabel: 'Legacy price (Quint Share)', currency: 'INR', availability: 'Enquire to confirm current availability', status: 'published' },
  { id: 'legacy-umrah-18-day', slug: 'shaban-ramdan-deluxe-18-days', title: 'Shaban + Ramdan Deluxe Umrah Package', category: 'umrah', shortDescription: 'An 18-day legacy Umrah itinerary with direct Delhi–Jeddah travel information.', description: 'Migrated from the legacy ZA International website. Enquire to confirm all current travel information.', featuredImage: '/images/umrah2.png', gallery: ['/images/umrah2.png'], duration: '18 days', itinerary: ['06 Feb: DEL to JED (20:05 – 23:45)', '23 Feb: JED to DEL (02:35 – 09:45)', 'Direct flight: Saudi Airlines'], inclusions: ['Umrah Visa & Kit', 'Ziyarat Included', '3 Times Meal Buffet', 'Laundry Service', '5 Litre Zamzam'], exclusions: ['Please confirm all current inclusions and exclusions with the team before travel.'], price: 121999, priceLabel: 'Legacy price (Quint Share)', currency: 'INR', availability: 'Enquire to confirm current availability', status: 'published' },
  { id: 'legacy-umrah-18-day-alt', slug: 'shaban-ramdan-deluxe-18-days-alt', title: 'Shaban + Ramdan Deluxe Umrah Package', category: 'umrah', shortDescription: 'The additional 18-day legacy Umrah listing retained from the original site.', description: 'Migrated from the legacy ZA International website. Enquire to confirm all current travel information.', featuredImage: '/images/hdgd.png', gallery: ['/images/hdgd.png'], duration: '18 days', itinerary: ['06 Feb: DEL to JED (20:05 – 23:45)', '23 Feb: JED to DEL (02:35 – 09:45)', 'Direct flight: Saudi Airlines'], inclusions: ['Umrah Visa & Kit', 'Ziyarat Included', '3 Times Meal Buffet', 'Laundry Service', '5 Litre Zamzam'], exclusions: ['Please confirm all current inclusions and exclusions with the team before travel.'], price: 121999, priceLabel: 'Legacy price (Quint Share)', currency: 'INR', availability: 'Enquire to confirm current availability', status: 'published' },
];

async function migrate() {
  console.table(packages.map(({ id, slug, title, status }) => ({ id, slug, title, status })));
  console.log(`Mode: ${apply ? 'APPLY — existing IDs will be merged, never deleted' : 'DRY RUN — no Firestore writes'}`);
  if (!apply) return;
  const batch = db.batch();
  for (const { id, ...data } of packages) batch.set(db.collection('packages').doc(id), { ...data, migrationSource: 'legacy-static-site-2026-10-24', updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  await batch.commit();
  console.log(`Migrated ${packages.length} package documents. No existing documents were deleted.`);
}

void migrate().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
