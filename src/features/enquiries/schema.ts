import { z } from 'zod';

export const enquirySchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(80),
  phone: z.string().trim().min(7, 'Please enter a valid phone number.').max(30),
  email: z.string().trim().email('Please enter a valid email address.').or(z.literal('')),
  category: z.enum(['general', 'hajj', 'umrah', 'jobs', 'travel', 'documentation']),
  selectedItem: z.string().max(150).optional(),
  travelDate: z.string().optional(),
  message: z.string().trim().min(10, 'Please share a little more so we can help.').max(1500),
  consent: z.boolean().refine((value) => value, 'Please confirm that we may respond to your enquiry.'),
});

export type EnquiryFormValues = z.infer<typeof enquirySchema>;
