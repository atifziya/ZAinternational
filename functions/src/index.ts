import { createHash } from 'node:crypto';
import { initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { z } from 'zod';

initializeApp();
const db = getFirestore();
const rateLimitSalt = defineSecret('ENQUIRY_RATE_LIMIT_SALT');

const inputSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(7).max(30),
  email: z.string().trim().email().max(160).or(z.literal('')).optional(),
  category: z.enum(['general', 'hajj', 'umrah', 'jobs', 'travel', 'documentation']),
  selectedItem: z.string().trim().max(150).optional(),
  travelDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
  message: z.string().trim().min(10).max(1500),
  consent: z.literal(true),
});

const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true';

/**
 * Public enquiry intake. App Check is enforced in production; this Function rate
 * limits by a salted, one-way daily request fingerprint and writes through Admin SDK
 * so visitor data never needs public Firestore access.
 */
export const submitEnquiry = onCall(
  {
    region: 'asia-south1',
    enforceAppCheck: !isEmulator,
    consumeAppCheckToken: !isEmulator,
    secrets: [rateLimitSalt],
  },
  async (request) => {
    const parsed = inputSchema.safeParse(request.data);
    if (!parsed.success) throw new HttpsError('invalid-argument', 'Please check the enquiry details and try again.');

    const forwarded = request.rawRequest.headers['x-forwarded-for'];
    const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : request.rawRequest.ip || 'unknown';
    const day = new Date().toISOString().slice(0, 10);
    const salt = isEmulator ? (process.env.ENQUIRY_RATE_LIMIT_SALT || 'emulator-salt') : rateLimitSalt.value();
    const fingerprint = createHash('sha256').update(`${salt}:${day}:${ip}`).digest('hex');
    const rateRef = db.collection('enquiryRateLimits').doc(fingerprint);

    await db.runTransaction(async (transaction) => {
      const current = await transaction.get(rateRef);
      const count = current.exists ? Number(current.data()?.count || 0) : 0;
      if (count >= 5) throw new HttpsError('resource-exhausted', 'Too many enquiries. Please try again later or contact the office directly.');
      transaction.set(rateRef, { count: count + 1, day, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    });

    const data = parsed.data;
    const enquiry = await db.collection('enquiries').add({
      ...data,
      email: data.email || null,
      selectedItem: data.selectedItem || null,
      travelDate: data.travelDate || null,
      status: 'new',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { id: enquiry.id };
  },
);
