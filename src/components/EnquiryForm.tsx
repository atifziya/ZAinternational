import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle2, LoaderCircle, MessageCircle, Send } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { siteSettings } from '../data/legacyContent';
import { hasFirebaseConfig } from '../firebase/client';
import { submitEnquiry } from '../firebase/repository';
import type { EnquiryInput } from '../types/content';
import { enquirySchema, type EnquiryFormValues } from '../features/enquiries/schema';

type FormValues = EnquiryFormValues;

export function EnquiryForm({
  category = 'general',
  selectedItem = '',
}: {
  category?: EnquiryInput['category'];
  selectedItem?: string;
}) {
  const { t } = useTranslation();
  const [state, setState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(enquirySchema),
    defaultValues: { category, selectedItem, consent: false },
  });

  const values = watch();

  const onSubmit = async (data: FormValues) => {
    // 1. Honeypot check: If bot filled the hidden honeypot, silently abort
    if (honeypot.trim() !== '') {
      setState('success');
      setMessage(t('form.successMsg', { defaultValue: 'Thank you. Your enquiry was received and the team will respond using the details you provided.' }));
      return;
    }

    // 2. Client-side throttling: minimum 15 seconds cooldown
    const lastSubmit = sessionStorage.getItem('za_last_enquiry');
    const now = Date.now();
    if (lastSubmit && now - Number(lastSubmit) < 15000) {
      setState('error');
      setMessage('Please wait a few seconds before submitting another enquiry, or contact our team directly on WhatsApp.');
      return;
    }

    if (!hasFirebaseConfig) {
      setState('error');
      setMessage(t('form.unconfiguredMsg', { defaultValue: 'Online enquiries are not configured yet. Please call or use the WhatsApp contact instead.' }));
      return;
    }

    setState('sending');
    setMessage('');
    try {
      await submitEnquiry(data);
      sessionStorage.setItem('za_last_enquiry', String(Date.now()));
      setState('success');
      setMessage(t('form.successMsg', { defaultValue: 'Thank you. Your enquiry was received and the team will respond using the details you provided.' }));
      reset({
        category: data.category,
        selectedItem: data.selectedItem,
        name: '',
        phone: '',
        email: '',
        travelDate: '',
        message: '',
        consent: false,
      });
    } catch {
      setState('error');
      setMessage(t('form.errorMsg', { defaultValue: 'We could not submit your enquiry. Please try again or contact the team directly.' }));
    }
  };

  const fieldError = (name: keyof FormValues) => errors[name]?.message;

  const whatsappMessage = encodeURIComponent(
    `Assalam-o-Alaikum, I would like to enquire about ${values.selectedItem || values.category}. Name: ${values.name || 'Visitor'}, Phone: ${values.phone || 'N/A'}. Message: ${values.message || 'Please provide details.'}`
  );

  return (
    <form className="enquiry-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Hidden honeypot field for bot prevention */}
      <div style={{ display: 'none' }} aria-hidden="true">
        <label htmlFor="website_url">Do not fill this field</label>
        <input
          id="website_url"
          name="website_url"
          type="text"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <div className="form-row">
        <Field label={t('form.fullName', { defaultValue: 'Full name' })} error={fieldError('name')}>
          <input autoComplete="name" {...register('name')} />
        </Field>
        <Field label={t('form.phone', { defaultValue: 'Phone or WhatsApp number' })} error={fieldError('phone')}>
          <input autoComplete="tel" inputMode="tel" {...register('phone')} />
        </Field>
      </div>

      <div className="form-row">
        <Field label={t('form.email', { defaultValue: 'Email address (optional)' })} error={fieldError('email')}>
          <input autoComplete="email" inputMode="email" {...register('email')} />
        </Field>
        <Field label={t('form.helpWith', { defaultValue: 'What can we help with?' })} error={fieldError('category')}>
          <select {...register('category')}>
            <option value="general">{t('form.generalEnquiry', { defaultValue: 'General enquiry' })}</option>
            <option value="hajj">{t('form.hajj', { defaultValue: 'Hajj' })}</option>
            <option value="umrah">{t('form.umrah', { defaultValue: 'Umrah' })}</option>
            <option value="jobs">{t('form.careers', { defaultValue: 'Overseas careers' })}</option>
            <option value="travel">{t('form.travel', { defaultValue: 'Travel services' })}</option>
            <option value="documentation">{t('form.documentation', { defaultValue: 'Documentation' })}</option>
          </select>
        </Field>
      </div>

      <div className="form-row">
        <Field label={t('form.packageOrRole', { defaultValue: 'Package or role (optional)' })} error={fieldError('selectedItem')}>
          <input {...register('selectedItem')} />
        </Field>
        <Field label={t('form.travelDate', { defaultValue: 'Preferred travel date (optional)' })} error={fieldError('travelDate')}>
          <input type="date" {...register('travelDate')} />
        </Field>
      </div>

      <Field label={t('form.messageLabel', { defaultValue: 'How can we help?' })} error={fieldError('message')}>
        <textarea rows={5} {...register('message')} />
      </Field>

      <label className="consent">
        <input type="checkbox" {...register('consent')} />
        <span>{t('form.consentText', { defaultValue: 'I agree that ZA International may use these details to respond to my enquiry. Do not send passport or payment details through this form.' })}</span>
      </label>
      {fieldError('consent') && <p className="field-error">{fieldError('consent')}</p>}

      {state !== 'idle' && (
        <div className={`form-notice ${state}`} role="status">
          {state === 'success' ? (
            <CheckCircle2 />
          ) : state === 'error' ? (
            <AlertCircle />
          ) : (
            <LoaderCircle className="spin" />
          )}
          <span>{message || 'Sending securely…'}</span>
          {state === 'error' && (
            <div style={{ marginTop: '.5rem' }}>
              <a
                className="button button-small button-outline"
                href={`https://wa.me/${siteSettings.whatsapp}?text=${whatsappMessage}`}
                target="_blank"
                rel="noreferrer"
                style={{ background: 'white' }}
              >
                <MessageCircle size={15} /> {t('common.chatOnWhatsapp', { defaultValue: 'Chat on WhatsApp' })}
              </a>
            </div>
          )}
        </div>
      )}

      <button className="button button-primary" type="submit" disabled={state === 'sending'}>
        {state === 'sending' ? t('form.sendingBtn', { defaultValue: 'Sending…' }) : t('form.sendBtn', { defaultValue: 'Send enquiry' })}{' '}
        <Send size={16} />
      </button>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}
