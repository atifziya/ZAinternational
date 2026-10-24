import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileText,
  LoaderCircle,
  MapPin,
  Search,
  ShieldAlert,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EnquiryForm } from '../components/EnquiryForm';
import { PackageCard } from '../components/PackageCard';
import { PageMeta } from '../components/PageMeta';
import { StatusBadge } from '../components/StatusBadge';
import { ServiceIcon } from '../components/ServiceIcon';
import { faqs, services, siteSettings, testimonials } from '../data/legacyContent';
import { useJobs, usePackages } from '../hooks/usePublicContent';

function PageHero({
  eyebrow,
  title,
  lead,
  image = '/images/slide2.jpeg',
}: {
  eyebrow: string;
  title: string;
  lead: string;
  image?: string;
}) {
  return (
    <section className="page-hero" style={{ '--hero-image': `url(${image})` } as React.CSSProperties}>
      <div className="page-hero-overlay" />
      <div className="content-width">
        <p className="eyebrow light">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{lead}</p>
      </div>
    </section>
  );
}

export function AboutPage() {
  const { t } = useTranslation();
  return (
    <>
      <PageMeta
        title={t('about.title', { defaultValue: 'About us' })}
        description={t('about.lead', { defaultValue: 'Learn about ZA International Tours & Travels, its approach, office contact and the services it supports.' })}
      />
      <PageHero
        eyebrow={t('about.eyebrow', { defaultValue: 'About ZA International' })}
        title={t('about.title', { defaultValue: 'Guidance that keeps people at the centre.' })}
        lead={t('about.lead', { defaultValue: 'A New Delhi team supporting pilgrimage, travel documentation and global-career enquiries with care and clarity.' })}
        image="/images/slide4.jpeg"
      />
      <section className="section content-width prose two-column">
        <div>
          <h2>{t('about.legacyHeading', { defaultValue: 'A legacy of trust' })}</h2>
          <p>{t('about.legacyP1', { defaultValue: 'With over 15 years of industry experience, ZA International Tours & Travels has become a familiar point of contact for families planning Haj and Umrah journeys and for people exploring international travel and careers.' })}</p>
          <p>{t('about.legacyP2', { defaultValue: 'The original site describes a history of 10,000+ travellers served and 500+ global placements. Those figures are retained as company-published information; individual current arrangements are always confirmed through an enquiry.' })}</p>
        </div>
        <aside className="quote-card">
          <p className="eyebrow">{t('about.approachHeading', { defaultValue: 'Our approach' })}</p>
          <p>{t('about.approachQuote', { defaultValue: '“Clear information, respectful support, and a next step you can understand.”' })}</p>
        </aside>
      </section>
      <section className="section section-soft">
        <div className="content-width value-grid">
          <article>
            <CheckCircle2 />
            <h3>{t('about.value1Title', { defaultValue: 'Clear process' })}</h3>
            <p>{t('about.value1Desc', { defaultValue: 'We communicate what is confirmed and what still needs to be verified.' })}</p>
          </article>
          <article>
            <CheckCircle2 />
            <h3>{t('about.value2Title', { defaultValue: 'Personal support' })}</h3>
            <p>{t('about.value2Desc', { defaultValue: 'A real team is available for questions about your next step.' })}</p>
          </article>
          <article>
            <CheckCircle2 />
            <h3>{t('about.value3Title', { defaultValue: 'Responsible guidance' })}</h3>
            <p>{t('about.value3Desc', { defaultValue: 'We do not represent enquiries as confirmed bookings, visas or jobs.' })}</p>
          </article>
        </div>
      </section>
    </>
  );
}

export function PackageListingPage({ category }: { category?: 'umrah' | 'hajj' }) {
  const { t } = useTranslation();
  const { items, loading } = usePackages(category);
  const title = category === 'hajj' ? t('nav.hajj') : category === 'umrah' ? t('nav.umrah') : t('nav.packages');

  return (
    <>
      <PageMeta
        title={title}
        description="Review retained ZA International pilgrimage information and enquire for confirmation of current availability and pricing."
      />
      <PageHero
        eyebrow={t('home.pilgrimageEyebrow', { defaultValue: 'Pilgrimage' })}
        title={title}
        lead="The listings below retain original site information. Travel dates, flights, hotels, pricing, and availability must be confirmed with the team."
        image={category === 'umrah' ? '/images/umrah1.png' : '/images/slide1.jpeg'}
      />
      <section className="section content-width">
        <div className="notice-banner">
          <AlertTriangle size={19} />
          <p>{t('common.enquiryRequired', { defaultValue: 'Enquiry required: no listing on this website is a confirmed booking or a guarantee of visa, airline, hotel, price, or availability.' })}</p>
        </div>
        {loading && <p className="loading-line">{t('common.loading', { defaultValue: 'Checking published package information…' })}</p>}
        {items.length ? (
          <div className="package-grid">
            {items.map((item) => (
              <PackageCard key={item.id} packageItem={item} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Hajj packages are published yet"
            text="Speak with the team for current Hajj guidance and availability."
            action={t('common.talkToTeam', { defaultValue: 'Contact the team' })}
            to="/contact"
          />
        )}
      </section>
    </>
  );
}

export function PackageDetailPage() {
  const { slug } = useParams();
  const { items, loading } = usePackages();
  const { t } = useTranslation();

  const selected = items.find((item) => item.slug === slug);

  if (loading && !selected) {
    return (
      <section className="section content-width" style={{ minHeight: '50vh', display: 'grid', placeContent: 'center' }}>
        <p className="loading-line" style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem' }}>
          <LoaderCircle className="spin" size={18} /> {t('common.loading', { defaultValue: 'Loading package details…' })}
        </p>
      </section>
    );
  }

  if (!selected) return <NotFoundPage />;

  const price = selected.price
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: selected.currency, maximumFractionDigits: 0 }).format(selected.price)
    : t('common.priceOnRequest', { defaultValue: 'On request' });

  const packageSchema = {
    '@context': 'https://schema.org',
    '@type': 'Trip',
    name: selected.title,
    description: selected.shortDescription || selected.description,
    offers: {
      '@type': 'Offer',
      price: selected.price || '0',
      priceCurrency: selected.currency || 'INR',
      availability: 'https://schema.org/InStock',
    },
    itinerary: selected.itinerary.map((step, idx) => ({
      '@type': 'ItemList',
      position: idx + 1,
      name: step,
    })),
  };

  return (
    <>
      <PageMeta
        title={selected.title}
        description={selected.shortDescription}
        image={selected.featuredImage}
        type="article"
        slug={`/packages/${selected.slug}`}
        schema={packageSchema}
      />
      <section className="detail-hero">
        <img src={selected.featuredImage} alt={selected.title} />
        <div className="detail-hero-overlay" />
        <div className="content-width">
          <p className="eyebrow light">
            {selected.category} · {selected.duration}
          </p>
          <h1>{selected.title}</h1>
          <p>{selected.shortDescription}</p>
        </div>
      </section>
      <section className="section content-width detail-layout">
        <article className="prose">
          <div className="detail-callout">
            <span>{selected.priceLabel || 'Price'}</span>
            <strong>{price}</strong>
            <small>{selected.availability}</small>
          </div>
          <h2>About this itinerary</h2>
          <p>{selected.description}</p>
          {selected.itinerary.length > 0 && (
            <>
              <h2>Published itinerary information</h2>
              <ul>
                {selected.itinerary.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </>
          )}
          {selected.inclusions.length > 0 && (
            <>
              <h2>Included on the listing</h2>
              <ul>
                {selected.inclusions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </>
          )}
          {selected.exclusions.length > 0 && (
            <>
              <h2>Important notes & exclusions</h2>
              <ul>
                {selected.exclusions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </>
          )}
        </article>
        <aside className="sticky-form">
          <p className="eyebrow">Next step</p>
          <h2>Confirm the current details</h2>
          <p>Tell us your preferred timing and the team can clarify what is currently available.</p>
          <EnquiryForm category={selected.category} selectedItem={selected.title} />
        </aside>
      </section>
    </>
  );
}

export function JobsPage() {
  const { t } = useTranslation();
  const { items, loading } = useJobs();
  const [term, setTerm] = useState('');
  const [country, setCountry] = useState('all');
  const [category, setCategory] = useState('all');

  const results = useMemo(
    () =>
      items.filter(
        (job) =>
          (country === 'all' || job.country === country) &&
          (category === 'all' || job.category === category) &&
          `${job.title} ${job.description} ${job.country}`.toLowerCase().includes(term.toLowerCase())
      ),
    [items, term, country, category]
  );

  const countries = [...new Set(items.map((job) => job.country))];
  const categories = [...new Set(items.map((job) => job.category))];

  return (
    <>
      <PageMeta
        title={t('jobs.title', { defaultValue: 'Global careers' })}
        description={t('jobs.lead', { defaultValue: 'Published overseas career opportunities from ZA International, with clear job status and responsible application guidance.' })}
      />
      <PageHero
        eyebrow={t('jobs.eyebrow', { defaultValue: 'Global careers' })}
        title={t('jobs.title', { defaultValue: 'Opportunity, presented responsibly.' })}
        lead={t('jobs.lead', { defaultValue: 'Search published roles when they are available. We never represent a role, employer verification, visa, or outcome as guaranteed.' })}
        image="/images/slide3.jpeg"
      />
      <section className="section content-width">
        <div className="safety-note">
          <ShieldAlert size={22} />
          <div>
            <strong>{t('jobs.safetyTitle', { defaultValue: 'Recruitment safety' })}</strong>
            <p>{t('jobs.safetyDesc', { defaultValue: 'Do not pay anyone or share passport documents based only on a listing. Confirm official instructions with ZA International before taking any action.' })}</p>
          </div>
        </div>
        <div className="filter-bar">
          <label>
            <Search size={17} />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder={t('jobs.searchPlaceholder', { defaultValue: 'Search title or keyword' })}
            />
          </label>
          <select value={country} onChange={(e) => setCountry(e.target.value)}>
            <option value="all">{t('jobs.allCountries', { defaultValue: 'All countries' })}</option>
            {countries.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">{t('jobs.allCategories', { defaultValue: 'All categories' })}</option>
            {categories.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </div>
        {loading ? (
          <p className="loading-line">{t('jobs.checking', { defaultValue: 'Checking published vacancies…' })}</p>
        ) : results.length ? (
          <div className="job-grid">
            {results.map((job) => (
              <article className="job-card" key={job.id}>
                <div>
                  <StatusBadge status={job.status} />
                  <p className="eyebrow">
                    {job.country}
                    {job.location ? ` · ${job.location}` : ''}
                  </p>
                  <h2>{job.title}</h2>
                  <p>{job.description}</p>
                </div>
                <Link className="text-link" to={`/jobs/${job.slug}`}>
                  {t('common.viewRole', { defaultValue: 'View role' })} <ArrowRight size={16} />
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title={t('jobs.emptyTitle', { defaultValue: 'Job updates will be posted soon' })}
            text={t('jobs.emptyDesc', { defaultValue: 'The original ZA International website had no active job listings. Future verified roles will appear here with a clear status and requirements.' })}
            action={t('jobs.askCareers', { defaultValue: 'Ask about careers' })}
            to="/contact"
          />
        )}
      </section>
    </>
  );
}

export function JobDetailPage() {
  const { slug } = useParams();
  const { items, loading } = useJobs();
  const { t } = useTranslation();

  const job = items.find((item) => item.slug === slug);

  if (loading && !job) {
    return (
      <section className="section content-width" style={{ minHeight: '50vh', display: 'grid', placeContent: 'center' }}>
        <p className="loading-line" style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem' }}>
          <LoaderCircle className="spin" size={18} /> {t('common.loading', { defaultValue: 'Loading job details…' })}
        </p>
      </section>
    );
  }

  if (!job) return <NotFoundPage />;

  const jobSchema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressCountry: job.country,
        addressLocality: job.location || job.country,
      },
    },
    employmentType: 'FULL_TIME',
  };

  return (
    <>
      <PageMeta
        title={job.title}
        description={job.description}
        image="/images/slide3.jpeg"
        type="article"
        slug={`/jobs/${job.slug}`}
        schema={jobSchema}
      />
      <PageHero
        eyebrow={`${job.country}${job.location ? ` · ${job.location}` : ''}`}
        title={job.title}
        lead={job.description}
        image="/images/slide3.jpeg"
      />
      <section className="section content-width detail-layout">
        <article className="prose">
          <StatusBadge status={job.status} />
          <h2>Role details</h2>
          <p>{job.description}</p>
          <h2>Requirements</h2>
          <ul>
            {job.requirements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {job.benefits.length > 0 && (
            <>
              <h2>Benefits stated</h2>
              <ul>
                {job.benefits.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </>
          )}
          <h2>Application guidance</h2>
          <p>{job.applicationInstructions}</p>
        </article>
        <aside className="sticky-form">
          <p className="eyebrow">Ask before applying</p>
          <h2>Request role guidance</h2>
          <EnquiryForm category="jobs" selectedItem={job.title} />
        </aside>
      </section>
    </>
  );
}

export function ServicesPage() {
  const { t } = useTranslation();
  return (
    <>
      <PageMeta
        title={t('services.title', { defaultValue: 'Travel & documentation services' })}
        description={t('services.lead', { defaultValue: 'Explore the travel, pilgrimage and documentation support listed by ZA International Tours & Travels.' })}
      />
      <PageHero
        eyebrow={t('services.eyebrow', { defaultValue: 'Travel & documentation' })}
        title={t('services.title', { defaultValue: 'Support for the journey around the journey.' })}
        lead={t('services.lead', { defaultValue: 'Pilgrimage support, travel planning, documentation guidance and international mobility services.' })}
        image="/images/slide5.jpeg"
      />
      <section className="section content-width">
        <div className="service-grid service-grid-wide">
          {services.map((service) => (
            <article className="service-tile" key={service.title}>
              <ServiceIcon name={service.icon as 'Kaaba'} />
              <h2>{service.title}</h2>
              <p>{service.description}</p>
              <Link className="text-link" to="/contact">
                {t('services.enquireService', { defaultValue: 'Enquire about this service' })} <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export function ContactPage() {
  const { t } = useTranslation();
  return (
    <>
      <PageMeta
        title={t('contact.title', { defaultValue: 'Contact' })}
        description={t('contact.lead', { defaultValue: 'Contact ZA International Tours & Travels in Shaheen Bagh, New Delhi for pilgrimage, travel, documentation, or global-career enquiries.' })}
      />
      <PageHero
        eyebrow={t('contact.eyebrow', { defaultValue: 'Contact ZA International' })}
        title={t('contact.title', { defaultValue: 'A conversation is the right place to start.' })}
        lead={t('contact.lead', { defaultValue: 'Tell us what you need. We will respond using the contact details you choose to share.' })}
        image="/images/slide4.jpeg"
      />
      <section className="section content-width contact-layout">
        <aside className="contact-card">
          <p className="eyebrow">{t('contact.officeEyebrow', { defaultValue: 'Office & contact' })}</p>
          <h2>{t('contact.reachTeam', { defaultValue: 'Reach the team' })}</h2>
          <p>
            <strong>{t('common.proprietor', { defaultValue: 'Proprietor' })}</strong>
            <br />
            {siteSettings.proprietor}
          </p>
          <p>
            <strong>{t('common.managedBy', { defaultValue: 'Managed by' })}</strong>
            <br />
            {siteSettings.managers.join(' & ')}
          </p>
          <p>
            <MapPin size={17} /> {siteSettings.address}
          </p>
          <p>
            <a href={`tel:${siteSettings.phones[0].replace(/\s/g, '')}`}>{siteSettings.phones[0]}</a>
            <br />
            <a href={`tel:${siteSettings.phones[1].replace(/\s/g, '')}`}>{siteSettings.phones[1]}</a>
          </p>
          <p>
            <a href={`mailto:${siteSettings.email}`}>{siteSettings.email}</a>
          </p>
          <a
            className="button button-outline"
            href={`https://wa.me/${siteSettings.whatsapp}`}
            target="_blank"
            rel="noreferrer"
          >
            {t('common.chatOnWhatsapp', { defaultValue: 'Chat on WhatsApp' })} <ArrowRight size={16} />
          </a>
        </aside>
        <div>
          <p className="eyebrow">{t('contact.sendEnquiryEyebrow', { defaultValue: 'Send an enquiry' })}</p>
          <h2>{t('contact.howCanWeHelp', { defaultValue: 'How can we help?' })}</h2>
          <p className="form-intro">
            {t('contact.formIntro', { defaultValue: 'Fields marked as optional are not required. Please do not include passport, identity, payment, or medical documents here.' })}
          </p>
          <EnquiryForm />
        </div>
      </section>
      <section className="section map-section">
        <div className="content-width">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{t('contact.findUsEyebrow', { defaultValue: 'Find us' })}</p>
              <h2>{t('contact.shaheenBagh', { defaultValue: 'Shaheen Bagh, New Delhi' })}</h2>
            </div>
            <a className="text-link" href={siteSettings.mapDirectionsUrl} target="_blank" rel="noreferrer">
              {t('common.getDirections', { defaultValue: 'Get directions' })} <ArrowRight size={16} />
            </a>
          </div>
          <iframe
            title={t('contact.locationTitle', { defaultValue: 'ZA International Tours & Travels location' })}
            src={siteSettings.mapEmbedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </>
  );
}

export function FaqPage() {
  const { t } = useTranslation();
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <PageMeta
        title={t('faq.title', { defaultValue: 'Frequently asked questions' })}
        description={t('faq.lead', { defaultValue: 'Answers about ZA International package enquiries, job listings, privacy and office contact.' })}
        schema={faqSchema}
      />
      <PageHero
        eyebrow={t('faq.eyebrow', { defaultValue: 'Helpful answers' })}
        title={t('faq.title', { defaultValue: 'Clarity before commitment.' })}
        lead={t('faq.lead', { defaultValue: 'A few practical answers before you contact the team.' })}
        image="/images/slide2.jpeg"
      />
      <section className="section content-width faq-page">
        {faqs.map((faq, index) => (
          <details key={faq.question} open={index === 0}>
            <summary>
              {faq.question}
              <ArrowRight size={17} />
            </summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </section>
    </>
  );
}

export function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      eyebrow="Privacy & data"
      sections={[
        [
          'Information we collect',
          'When you send an enquiry, we collect the information you choose to provide, such as your name, contact details, service interest, travel preference, and message. Do not send passport, identity, health, or payment information through the website enquiry form.',
        ],
        [
          'How information is used',
          'Your enquiry details are used to respond to your request, provide relevant service guidance, and maintain service records where required. We do not sell personal data for marketing.',
        ],
        [
          'Sharing and retention',
          'Information may be shared only when necessary to provide a requested service or meet legal obligations, such as with relevant travel or government-related service providers. Retention periods depend on the service and applicable requirements.',
        ],
        [
          'Your choices',
          'You may ask about the personal information held in relation to your enquiry, request corrections, or ask questions about privacy by contacting info@zainternational.co.in.',
        ],
      ]}
    />
  );
}

export function TermsPage() {
  return (
    <LegalPage
      title="Terms of use"
      eyebrow="Terms"
      sections={[
        [
          'Information on this site',
          'Package, travel, and service information is provided for general guidance. It may change and must be confirmed directly with ZA International before any decision, payment, or travel arrangement.',
        ],
        [
          'No confirmed booking or guarantee',
          'Submitting an enquiry does not create a booking, employment placement, visa entitlement, ticket, or service contract. No job, visa, travel, or recruitment outcome is guaranteed.',
        ],
        [
          'Responsible use',
          'Do not misuse the enquiry form, submit another person’s personal data without permission, or share sensitive documents through the website.',
        ],
        [
          'Contact',
          'For current terms that may apply to a specific service, ask the ZA team before proceeding.',
        ],
      ]}
    />
  );
}

function LegalPage({
  title,
  eyebrow,
  sections,
}: {
  title: string;
  eyebrow: string;
  sections: [string, string][];
}) {
  return (
    <>
      <PageMeta title={title} description={`${title} for ZA International Tours & Travels.`} />
      <PageHero
        eyebrow={eyebrow}
        title={title}
        lead="Please read this page alongside any service-specific information confirmed by the team."
      />
      <article className="section content-width prose legal-content">
        {sections.map(([heading, content], index) => (
          <section key={heading}>
            <p className="eyebrow">0{index + 1}</p>
            <h2>{heading}</h2>
            <p>{content}</p>
          </section>
        ))}
      </article>
    </>
  );
}

export function TestimonialsPage() {
  return (
    <>
      <PageMeta
        title="Pilgrim voices"
        description="Pilgrim feedback preserved from the original ZA International website."
      />
      <PageHero
        eyebrow="Pilgrim voices"
        title="Experiences shared on the original site."
        lead="The comments below have been retained from the legacy website. They are historical testimonials, not a promise of a future outcome."
        image="/images/slide1.jpeg"
      />
      <section className="section content-width testimonial-grid">
        {testimonials.map((item) => (
          <blockquote key={item.name}>
            <p>“{item.quote}”</p>
            <footer>
              <strong>{item.name}</strong>
              <span>{item.context}</span>
            </footer>
          </blockquote>
        ))}
      </section>
    </>
  );
}

export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <section className="not-found">
      <p className="eyebrow">404</p>
      <h1>That page has not found its way.</h1>
      <p>Try the home page or contact the team for help.</p>
      <Link className="button button-primary" to="/">
        {t('common.returnHome', { defaultValue: 'Return home' })} <ArrowRight size={16} />
      </Link>
    </section>
  );
}

function EmptyState({
  title,
  text,
  action,
  to,
}: {
  title: string;
  text: string;
  action: string;
  to: string;
}) {
  return (
    <div className="empty-state">
      <FileText size={32} />
      <h2>{title}</h2>
      <p>{text}</p>
      <Link className="button button-outline" to={to}>
        {action} <ArrowRight size={16} />
      </Link>
    </div>
  );
}
