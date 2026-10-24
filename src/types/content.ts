export type Locale = 'en' | 'hi' | 'ur';
export type PublishStatus = 'draft' | 'published' | 'closed' | 'archived';

export interface Package {
  id: string;
  slug: string;
  title: string;
  category: 'umrah' | 'hajj';
  shortDescription: string;
  description: string;
  featuredImage: string;
  gallery: string[];
  duration: string;
  itinerary: string[];
  inclusions: string[];
  exclusions: string[];
  price?: number;
  priceLabel?: string;
  currency: string;
  availability: string;
  status: PublishStatus;
  departureDate?: string;
  updatedAt?: string;
}

export interface Job {
  id: string;
  slug: string;
  title: string;
  country: string;
  location?: string;
  category: string;
  description: string;
  requirements: string[];
  benefits: string[];
  applicationInstructions: string;
  status: PublishStatus;
  salary?: string;
  currency?: string;
  applicationDeadline?: string;
  updatedAt?: string;
}

export type EnquiryStatus = 'new' | 'contacted' | 'in_progress' | 'resolved';

export interface EnquiryInput {
  name: string;
  phone: string;
  email?: string;
  category: 'general' | 'hajj' | 'umrah' | 'jobs' | 'travel' | 'documentation';
  selectedItem?: string;
  travelDate?: string;
  message: string;
  consent: boolean;
}

export interface Enquiry extends EnquiryInput {
  id: string;
  status: EnquiryStatus;
  internalNotes?: string;
  createdAt?: string;
}

export interface SiteSettings {
  companyName: string;
  proprietor: string;
  managers: string[];
  address: string;
  phones: string[];
  whatsapp: string;
  email: string;
  mapEmbedUrl: string;
  mapDirectionsUrl: string;
}
