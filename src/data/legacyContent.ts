import type { Package, SiteSettings } from '../types/content';

export const siteSettings: SiteSettings = {
  companyName: 'ZA International Tours & Travels',
  proprietor: 'Zishan Alam',
  managers: ['Mr. Shadab Alam', 'Mr. Atif Ziya'],
  address: 'Shaheen Bagh, Okhla, New Delhi - 110025',
  phones: ['+91 88773 85139', '+91 84204 96274'],
  whatsapp: '918877385139',
  email: 'info@zainternational.co.in',
  mapEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3445.4381914784653!2d77.2979932754977!3d28.5468239757117!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce51ea8808229%3A0x96a442b0543bef44!2sZA%20International%20Tours%20%26%20Travels!5e1!3m2!1sen!2sin!4v1774719815358!5m2!1sen!2sin',
  mapDirectionsUrl: 'https://www.google.com/maps/search/?api=1&query=ZA+International+Tours+%26+Travels+Shaheen+Bagh+New+Delhi',
};

// Faithfully migrated from the legacy Umrah page. The legacy dates have no year,
// so packages are explicitly enquiry-only rather than represented as bookable inventory.
export const legacyPackages: Package[] = [
  {
    id: 'legacy-umrah-20-day',
    slug: 'shaban-ramdan-deluxe-20-days',
    title: 'Shaban + Ramdan Deluxe Umrah Package',
    category: 'umrah',
    shortDescription: 'A 20-day legacy Umrah itinerary with direct Delhi–Jeddah travel information.',
    description:
      'This legacy itinerary includes the original flight and service details published by ZA International. Please enquire to confirm current dates, accommodation, price, and availability before making travel arrangements.',
    featuredImage: '/images/umrah1.png',
    gallery: ['/images/umrah1.png'],
    duration: '20 days',
    itinerary: [
      '07 Feb: Delhi (DEL) to Jeddah (JED)',
      '27 Feb: Jeddah (JED) to Delhi (DEL)',
      'Direct flight: Indigo Airlines',
    ],
    inclusions: ['Umrah Visa & Insurance', 'Complete Umrah Kit', '3 Times Meal Buffet', 'Weekly Laundry Service', '5 Litre Zamzam'],
    exclusions: ['Please confirm all current inclusions and exclusions with the team before travel.'],
    price: 123999,
    priceLabel: 'Legacy price (Quint Share)',
    currency: 'INR',
    availability: 'Enquire to confirm current availability',
    status: 'published',
  },
  {
    id: 'legacy-umrah-18-day',
    slug: 'shaban-ramdan-deluxe-18-days',
    title: 'Shaban + Ramdan Deluxe Umrah Package',
    category: 'umrah',
    shortDescription: 'An 18-day legacy Umrah itinerary with direct Delhi–Jeddah travel information.',
    description:
      'This legacy itinerary includes the original flight and service details published by ZA International. Please enquire to confirm current dates, accommodation, price, and availability before making travel arrangements.',
    featuredImage: '/images/umrah2.png',
    gallery: ['/images/umrah2.png'],
    duration: '18 days',
    itinerary: [
      '06 Feb: DEL to JED (20:05 – 23:45)',
      '23 Feb: JED to DEL (02:35 – 09:45)',
      'Direct flight: Saudi Airlines',
    ],
    inclusions: ['Umrah Visa & Kit', 'Ziyarat Included', '3 Times Meal Buffet', 'Laundry Service', '5 Litre Zamzam'],
    exclusions: ['Please confirm all current inclusions and exclusions with the team before travel.'],
    price: 121999,
    priceLabel: 'Legacy price (Quint Share)',
    currency: 'INR',
    availability: 'Enquire to confirm current availability',
    status: 'published',
  },
  {
    id: 'legacy-umrah-18-day-alt',
    slug: 'shaban-ramdan-deluxe-18-days-alt',
    title: 'Shaban + Ramdan Deluxe Umrah Package',
    category: 'umrah',
    shortDescription: 'The additional 18-day legacy Umrah listing retained from the original site.',
    description:
      'This separate legacy listing has been retained from the original website. Please enquire for a current quotation and confirmation of every travel detail.',
    featuredImage: '/images/hdgd.png',
    gallery: ['/images/hdgd.png'],
    duration: '18 days',
    itinerary: [
      '06 Feb: DEL to JED (20:05 – 23:45)',
      '23 Feb: JED to DEL (02:35 – 09:45)',
      'Direct flight: Saudi Airlines',
    ],
    inclusions: ['Umrah Visa & Kit', 'Ziyarat Included', '3 Times Meal Buffet', 'Laundry Service', '5 Litre Zamzam'],
    exclusions: ['Please confirm all current inclusions and exclusions with the team before travel.'],
    price: 121999,
    priceLabel: 'Legacy price (Quint Share)',
    currency: 'INR',
    availability: 'Enquire to confirm current availability',
    status: 'published',
  },
];

export const services = [
  { icon: 'Kaaba', title: 'Hajj & Umrah', description: 'Considered pilgrimage assistance, guided support, and accommodation coordination.' },
  { icon: 'Passport', title: 'Visa Assistance', description: 'Support for tourist, business, and work-visa documentation where applicable.' },
  { icon: 'Plane', title: 'Air Tickets', description: 'Domestic and international travel planning with fare and itinerary guidance.' },
  { icon: 'FileCheck', title: 'Passport Services', description: 'Support for new passports, renewals, and ECR/ENOR-related requirements.' },
  { icon: 'ScrollText', title: 'Document Attestation', description: 'Guidance for degree, birth, and marriage certificate attestation processes.' },
  { icon: 'Map', title: 'Holiday Packages', description: 'International and domestic travel planning tailored to your needs.' },
];

export const testimonials = [
  { name: 'Mohammad Imran', context: 'Umrah — Feb 2026', quote: 'Management was excellent. The hotel in Makkah was very close to the Haram, which made it easy for my elderly parents. Highly recommend ZA International.' },
  { name: 'Arshad Sheikh', context: 'Umrah — Jan 2026', quote: 'The food and transport services were seamless. Mr. Shadab and Atif Bhai took care of every small detail during our 15-day Umrah trip. No hidden costs at all.' },
  { name: 'Sajid Khan', context: 'Umrah — March 2026', quote: 'Transparent pricing and honest service. Everything promised in the package was delivered. Best Haj & Umrah service in Shaheen Bagh.' },
  { name: 'Abdul Rahman', context: 'Haj — 2025', quote: 'Haj 2025 was a smooth experience only because of ZA International. The group leaders were very knowledgeable and helpful during the stay at Mina.' },
  { name: 'Farhan Akhtar', context: 'Umrah — Dec 2025', quote: 'Choosing ZA International was the best decision for our family Umrah. The Ziyarat tours were very well organized and informative.' },
  { name: 'Zaid Mansuri', context: 'Umrah — Jan 2026', quote: 'Very professional staff. They handled our documentation and visa issues in record time. I will definitely travel with them again.' },
];

export const faqs = [
  { question: 'Can I confirm a pilgrimage package online?', answer: 'No. The website supports an enquiry workflow only. A member of the ZA team will confirm the current itinerary, documents, price, and availability with you.' },
  { question: 'Are job vacancies guaranteed?', answer: 'No. The current site has no published vacancies. Future listings will show their status clearly; recruitment outcomes and visa decisions are never guaranteed.' },
  { question: 'What information should I provide in an enquiry?', answer: 'Your name, contact number, service of interest, and a short message are enough to begin. Do not send passport, payment-card, or other sensitive documents through this form.' },
  { question: 'Where is the office located?', answer: 'ZA International Tours & Travels is listed at Shaheen Bagh, Okhla, New Delhi - 110025. Use the directions link on the contact page before visiting.' },
];
