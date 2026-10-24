import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
} from 'firebase/firestore';
import { firebaseServices } from './client';
import type { Enquiry, EnquiryInput, Job, Package, PublishStatus, SiteSettings } from '../types/content';

const toPlain = <T>(id: string, data: DocumentData): T => ({ id, ...data }) as T;

export async function getPublicPackages(category?: Package['category']): Promise<Package[]> {
  const { db } = firebaseServices();
  const constraints = [where('status', '==', 'published')];
  if (category) constraints.push(where('category', '==', category));
  const snapshot = await getDocs(query(collection(db, 'packages'), ...constraints));
  return snapshot.docs.map((entry) => toPlain<Package>(entry.id, entry.data()));
}

export async function getPublicJobs(): Promise<Job[]> {
  const { db } = firebaseServices();
  const snapshot = await getDocs(query(collection(db, 'jobs'), where('status', '==', 'published')));
  return snapshot.docs.map((entry) => toPlain<Job>(entry.id, entry.data()));
}

export async function getAdminCollection<T>(name: 'packages' | 'jobs' | 'enquiries', newestFirst = false): Promise<T[]> {
  const { db } = firebaseServices();
  const base = collection(db, name);
  const snapshot = await getDocs(newestFirst ? query(base, orderBy('createdAt', 'desc'), limit(100)) : base);
  return snapshot.docs.map((entry) => toPlain<T>(entry.id, entry.data()));
}

function cleanPayload<T extends Record<string, unknown>>(data: T): Partial<T> {
  const result: Partial<T> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      result[key as keyof T] = value as T[keyof T];
    }
  }
  return result;
}

export async function savePackage(record: Package): Promise<void> {
  const { db } = firebaseServices();
  const { id, ...payload } = record;
  const cleaned = cleanPayload(payload as Record<string, unknown>);
  await setDoc(doc(db, 'packages', id), { ...cleaned, updatedAt: serverTimestamp() }, { merge: true });
}

export async function saveJob(record: Job): Promise<void> {
  const { db } = firebaseServices();
  const { id, ...payload } = record;
  const cleaned = cleanPayload(payload as Record<string, unknown>);
  await setDoc(doc(db, 'jobs', id), { ...cleaned, updatedAt: serverTimestamp() }, { merge: true });
}

export async function deleteManagedRecord(collectionName: 'packages' | 'jobs' | 'enquiries', id: string): Promise<void> {
  const { db } = firebaseServices();
  await deleteDoc(doc(db, collectionName, id));
}

export async function updateEnquiry(id: string, status: Enquiry['status'], internalNotes: string): Promise<void> {
  const { db } = firebaseServices();
  await updateDoc(doc(db, 'enquiries', id), { status, internalNotes, updatedAt: serverTimestamp() });
}

export async function getSiteSettings(): Promise<SiteSettings | undefined> {
  const { db } = firebaseServices();
  const snapshot = await getDocs(collection(db, 'siteSettings'));
  const page = snapshot.docs.find((entry) => entry.id === 'public');
  return page ? (page.data() as SiteSettings) : undefined;
}

export async function saveSiteSettings(settings: SiteSettings): Promise<void> {
  const { db } = firebaseServices();
  await setDoc(doc(db, 'siteSettings', 'public'), { ...settings, updatedAt: serverTimestamp() }, { merge: true });
}

export async function submitEnquiry(input: EnquiryInput): Promise<{ id: string }> {
  const { db } = firebaseServices();
  const docRef = await addDoc(collection(db, 'enquiries'), {
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email && input.email.trim() ? input.email.trim() : null,
    category: input.category,
    selectedItem: input.selectedItem && input.selectedItem.trim() ? input.selectedItem.trim() : null,
    travelDate: input.travelDate && input.travelDate.trim() ? input.travelDate.trim() : null,
    message: input.message.trim(),
    consent: true,
    status: 'new',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id: docRef.id };
}

export function blankPackage(): Package {
  return {
    id: crypto.randomUUID(), slug: '', title: '', category: 'umrah', shortDescription: '', description: '', featuredImage: '', gallery: [], duration: '', itinerary: [], inclusions: [], exclusions: [], currency: 'INR', availability: 'Enquire to confirm current availability', status: 'draft',
  };
}

export function blankJob(): Job {
  return {
    id: crypto.randomUUID(), slug: '', title: '', country: '', category: '', description: '', requirements: [], benefits: [], applicationInstructions: '', status: 'draft',
  };
}

export const publishOptions: { value: PublishStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' }, { value: 'closed', label: 'Closed' }, { value: 'archived', label: 'Archived' },
];

export async function addAdminActivity(action: string, entityType: string, entityId: string): Promise<void> {
  const { db } = firebaseServices();
  await addDoc(collection(db, 'adminActivity'), { action, entityType, entityId, createdAt: serverTimestamp() });
}
