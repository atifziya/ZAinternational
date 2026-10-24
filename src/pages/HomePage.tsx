import { ArrowRight, BriefcaseBusiness, Check, ChevronRight, HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { faqs, services, siteSettings } from '../data/legacyContent';
import { PackageCard } from '../components/PackageCard';
import { PageMeta } from '../components/PageMeta';
import { ServiceIcon } from '../components/ServiceIcon';
import { usePackages } from '../hooks/usePublicContent';

export function HomePage() {
  const { t } = useTranslation();
  const { items } = usePackages('umrah');

  const steps = [
    t('home.steps.0', { defaultValue: 'Tell us what you need' }),
    t('home.steps.1', { defaultValue: 'Receive clear guidance' }),
    t('home.steps.2', { defaultValue: 'Confirm your next step' }),
  ];

  const stats = [
    ['15+', t('home.stats.experience', { defaultValue: 'years of experience' })],
    ['10k+', t('home.stats.travellers', { defaultValue: 'travellers served' })],
    ['500+', t('home.stats.placements', { defaultValue: 'global placements' })],
  ];

  return (
    <>
      <PageMeta
        title={t('home.title', { defaultValue: 'Journeys with care' })}
        description={t('home.lead', { defaultValue: 'ZA International Tours & Travels offers considered Hajj, Umrah, travel, documentation and global-career guidance from New Delhi.' })}
      />
      <section className="hero-home">
        <div className="hero-backdrop" />
        <div className="hero-grid-pattern" />
        <div className="hero-inner">
          <p className="eyebrow light">
            <Sparkles size={15} /> {t('home.eyebrow')}
          </p>
          <h1>{t('home.title')}</h1>
          <p className="hero-lead">{t('home.lead')}</p>
          <div className="hero-actions">
            <Link className="button button-primary" to="/packages">
              {t('common.viewPackages')} <ArrowRight size={17} />
            </Link>
            <Link className="button button-ghost" to="/contact">
              {t('common.enquire')}
            </Link>
          </div>
          <div className="hero-trust">
            <span>
              <ShieldCheck size={17} /> {t('home.heroTrust1', { defaultValue: 'Clear, enquiry-first process' })}
            </span>
            <span>
              <HeartHandshake size={17} /> {t('home.heroTrust2', { defaultValue: 'Personal support' })}
            </span>
          </div>
        </div>
        <div className="hero-caption">
          {t('home.heroCaption', { defaultValue: 'Makkah & Madinah journeys, managed with respect' })}
        </div>
      </section>

      <section className="stats-section" aria-label="ZA International highlights">
        <div className="content-width stats-grid">
          {stats.map(([value, label]) => (
            <div key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section content-width split-intro">
        <div>
          <p className="eyebrow">{t('home.aboutEyebrow', { defaultValue: 'ZA International' })}</p>
          <h2>{t('home.aboutTitle')}</h2>
        </div>
        <div>
          <p>{t('home.aboutText')}</p>
          <Link className="text-link" to="/about">
            {t('home.learnAbout', { defaultValue: 'Learn about ZA International' })} <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      <section className="section section-soft">
        <div className="content-width">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{t('home.pilgrimageEyebrow', { defaultValue: 'Pilgrimage' })}</p>
              <h2>{t('home.pilgrimageTitle')}</h2>
            </div>
            <p>{t('home.pilgrimageDesc')}</p>
          </div>
          <div className="package-grid">
            {items.slice(0, 3).map((item) => (
              <PackageCard key={item.id} packageItem={item} />
            ))}
          </div>
          <div className="center-action">
            <Link className="button button-outline" to="/umrah">
              {t('common.allPackages', { defaultValue: 'All Umrah packages' })} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="section content-width">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t('home.servicesEyebrow', { defaultValue: 'What we help with' })}</p>
            <h2>{t('home.servicesTitle')}</h2>
          </div>
          <Link className="text-link" to="/services">
            {t('common.allServices', { defaultValue: 'View all services' })} <ArrowRight size={16} />
          </Link>
        </div>
        <div className="service-grid">
          {services.slice(0, 4).map((service) => (
            <article className="service-tile" key={service.title}>
              <ServiceIcon name={service.icon as 'Kaaba'} />
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="process-section">
        <div className="content-width process-layout">
          <div>
            <p className="eyebrow light">{t('home.processEyebrow', { defaultValue: 'Simple by design' })}</p>
            <h2>{t('home.processTitle')}</h2>
            <p>{t('home.processDesc')}</p>
            <Link className="button button-secondary" to="/contact">
              {t('common.talkToTeam', { defaultValue: 'Talk to the team' })} <ArrowRight size={16} />
            </Link>
          </div>
          <ol>
            {steps.map((step, index) => (
              <li key={step}>
                <span>0{index + 1}</span>
                <strong>{step}</strong>
                <Check size={19} />
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section content-width career-callout">
        <div>
          <p className="eyebrow">{t('home.careerEyebrow', { defaultValue: 'Global careers' })}</p>
          <h2>{t('home.careerTitle')}</h2>
          <p>{t('home.careerDesc')}</p>
        </div>
        <Link className="button button-outline" to="/jobs">
          <BriefcaseBusiness size={17} /> {t('common.visitJobs', { defaultValue: 'Visit jobs portal' })}
        </Link>
      </section>

      <section className="section section-soft">
        <div className="content-width faq-preview">
          <div>
            <p className="eyebrow">{t('home.faqEyebrow', { defaultValue: 'Helpful answers' })}</p>
            <h2>{t('home.faqTitle')}</h2>
            <p>{t('home.faqDesc')}</p>
            <Link className="text-link" to="/faq">
              {t('common.seeEveryFaq', { defaultValue: 'See every FAQ' })} <ArrowRight size={16} />
            </Link>
          </div>
          <div>
            {faqs.slice(0, 3).map((faq) => (
              <details key={faq.question}>
                <summary>
                  {faq.question}
                  <ChevronRight size={18} />
                </summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="contact-band">
        <div className="content-width">
          <div>
            <p className="eyebrow light">{t('home.contactBandEyebrow', { defaultValue: 'Let’s talk' })}</p>
            <h2>{t('home.contactBandTitle')}</h2>
            <p>{t('home.contactBandDesc')}</p>
          </div>
          <div>
            <a
              className="button button-primary"
              href={`https://wa.me/${siteSettings.whatsapp}`}
              target="_blank"
              rel="noreferrer"
            >
              {t('common.whatsappTeam', { defaultValue: 'WhatsApp the team' })} <ArrowRight size={16} />
            </a>
            <Link className="button button-ghost" to="/contact">
              {t('common.contactDetails', { defaultValue: 'Contact details' })}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
