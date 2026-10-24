import { useEffect, useState } from 'react';
import { ChevronDown, Globe2, Menu, X, ArrowUpRight, MapPin, Phone } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { siteSettings } from '../data/legacyContent';

const links = [
  ['/', 'home'], ['/about', 'about'], ['/hajj', 'hajj'], ['/umrah', 'umrah'], ['/packages', 'packages'], ['/jobs', 'jobs'], ['/services', 'services'], ['/faq', 'faq'],
] as const;

export function SiteShell() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  useEffect(() => { setOpen(false); }, [location.pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const changeLocale = (locale: string) => {
    void i18n.changeLanguage(locale);
    localStorage.setItem('za-locale', locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ur' ? 'rtl' : 'ltr';
  };
  return <div className="site-shell">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <Link className="brand" to="/" aria-label="ZA International home"><img src="/images/logo.png" alt="ZA International logo" /><span><strong>ZA International</strong><small>Tours & Travels</small></span></Link>
      <button className="menu-button" type="button" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      <nav className={open ? 'site-nav is-open' : 'site-nav'} aria-label="Main navigation">
        <div className="nav-links">{links.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'}>{t(`nav.${label}`)}</NavLink>)}</div>
        <div className="nav-actions">
          <label className="language-picker"><Globe2 size={16} /><span className="sr-only">Language</span><select value={i18n.language} onChange={(event) => changeLocale(event.target.value)}><option value="en">EN</option><option value="hi">हिंदी</option><option value="ur">اردو</option></select><ChevronDown size={14} /></label>
          <Link className="button button-primary button-small" to="/contact">{t('common.enquire')} <ArrowUpRight size={16} /></Link>
        </div>
      </nav>
    </header>
    <main id="main-content"><Outlet /></main>
    <footer className="site-footer">
      <div className="footer-grid">
        <section>
          <Link className="brand footer-brand" to="/">
            <img src="/images/logo.png" alt="" />
            <span>
              <strong>ZA International</strong>
              <small>Tours & Travels</small>
            </span>
          </Link>
          <p>{t('footer.mission', { defaultValue: 'Thoughtful pilgrimage, travel, documentation and career guidance from Shaheen Bagh, New Delhi.' })}</p>
          <Link className="text-link" to="/contact">
            {t('footer.speakWithTeam', { defaultValue: 'Speak with our team' })} <ArrowUpRight size={15} />
          </Link>
        </section>
        <section>
          <h2>{t('footer.explore', { defaultValue: 'Explore' })}</h2>
          <Link to="/hajj">{t('nav.hajj')}</Link>
          <Link to="/umrah">{t('nav.umrah')}</Link>
          <Link to="/jobs">{t('nav.jobs')}</Link>
          <Link to="/services">{t('nav.services')}</Link>
        </section>
        <section>
          <h2>{t('footer.information', { defaultValue: 'Information' })}</h2>
          <Link to="/about">{t('nav.about')}</Link>
          <Link to="/faq">{t('nav.faq')}</Link>
          <Link to="/pilgrimage">{t('nav.pilgrimage', { defaultValue: 'Pilgrim Voices' })}</Link>
          <Link to="/privacy-policy">{t('nav.privacy', { defaultValue: 'Privacy Policy' })}</Link>
          <Link to="/terms">{t('nav.terms', { defaultValue: 'Terms of Use' })}</Link>
        </section>
        <section>
          <h2>{t('footer.contact', { defaultValue: 'Contact' })}</h2>
          <a href={`tel:${siteSettings.phones[0].replace(/\s/g, '')}`}>
            <Phone size={15} /> {siteSettings.phones[0]}
          </a>
          <a href={`mailto:${siteSettings.email}`}>{siteSettings.email}</a>
          <a href={siteSettings.mapDirectionsUrl} target="_blank" rel="noreferrer">
            <MapPin size={15} /> {t('contact.shaheenBagh', { defaultValue: 'Shaheen Bagh, New Delhi' })}
          </a>
        </section>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} {t('footer.allRightsReserved', { defaultValue: 'ZA International Tours & Travels. All rights reserved.' })}</span>
        <Link to="/admin/login">{t('footer.adminAccess', { defaultValue: 'Administrator access' })}</Link>
      </div>
    </footer>
  </div>;
}
