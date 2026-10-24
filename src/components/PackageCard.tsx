import { ArrowUpRight, CalendarDays, Clock3, IndianRupee } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Package } from '../types/content';

export function PackageCard({ packageItem }: { packageItem: Package }) {
  const price = packageItem.price ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: packageItem.currency, maximumFractionDigits: 0 }).format(packageItem.price) : undefined;
  return <article className="package-card">
    <div className="package-image-wrap"><img src={packageItem.featuredImage || '/images/slide1.jpeg'} alt="" loading="lazy" /><span className="tag">{packageItem.category}</span></div>
    <div className="package-card-body"><div className="package-meta"><span><Clock3 size={15} /> {packageItem.duration || 'Duration on request'}</span><span><CalendarDays size={15} /> Enquiry only</span></div><h3>{packageItem.title}</h3><p>{packageItem.shortDescription}</p><div className="package-card-footer"><div>{price ? <><small>{packageItem.priceLabel || 'From'}</small><strong><IndianRupee size={17} />{price.replace('₹', '')}</strong></> : <small>Price on request</small>}</div><Link className="icon-link" to={`/packages/${packageItem.slug}`} aria-label={`View ${packageItem.title}`}><ArrowUpRight /></Link></div></div>
  </article>;
}
