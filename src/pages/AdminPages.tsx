import {
  browserLocalPersistence,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { deleteObject, getDownloadURL, listAll, ref, uploadBytesResumable } from 'firebase/storage';
import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronLeft,
  Copy,
  ExternalLink,
  Eye,
  ImagePlus,
  LoaderCircle,
  MessageCircle,
  Phone,
  Plus,
  Save,
  Search,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../features/auth/AuthProvider';
import { firebaseServices } from '../firebase/client';
import {
  blankJob,
  blankPackage,
  deleteManagedRecord,
  getAdminCollection,
  getSiteSettings,
  publishOptions,
  saveJob,
  savePackage,
  saveSiteSettings,
  updateEnquiry,
} from '../firebase/repository';
import { siteSettings as defaultSiteSettings } from '../data/legacyContent';
import type { Enquiry, Job, Package, SiteSettings } from '../types/content';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { loading, isAdmin, configured } = useAuth();
  if (loading) return <AdminLoading />;
  if (!configured)
    return (
      <AdminMessage
        title="Firebase configuration is required"
        text="Administrator access is disabled until the public Firebase app configuration is set in .env.local."
      />
    );
  if (!isAdmin) return <Navigate to="/admin/login" replace />;
  return <AdminLayout>{children}</AdminLayout>;
}

export function AdminLoading() {
  return (
    <div className="admin-loading">
      <LoaderCircle className="spin" size={24} /> Loading secure workspace…
    </div>
  );
}

function AdminMessage({ title, text }: { title: string; text: string }) {
  return (
    <main className="admin-message">
      <p className="eyebrow">Administrator access</p>
      <h1>{title}</h1>
      <p>{text}</p>
      <Link className="button button-primary" to="/">
        Back to website
      </Link>
    </main>
  );
}

export function AdminLoginPage() {
  const { configured, user, isAdmin, loading, signOutUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading) return <AdminLoading />;
  if (!configured)
    return (
      <AdminMessage
        title="Firebase configuration is required"
        text="Create .env.local from .env.example, then configure Authentication and the administrator custom claim before using the dashboard."
      />
    );
  if (user && isAdmin) return <Navigate to="/admin" replace />;

  const signIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const { auth } = firebaseServices();
      await setPersistence(auth, browserLocalPersistence);
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const token = await credential.user.getIdTokenResult(true);
      if (token.claims.admin !== true) {
        await signOutUser();
        setMessage('This account is authenticated but is not authorized as an administrator.');
      } else {
        navigate('/admin');
      }
    } catch {
      setMessage('Sign-in failed. Check the email and password, or request a password reset.');
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    if (!email) {
      setMessage('Enter your email address first, then request a password reset.');
      return;
    }
    try {
      await sendPasswordResetEmail(firebaseServices().auth, email);
      setMessage('Password-reset instructions were sent if this email belongs to an account.');
    } catch {
      setMessage('We could not send a password-reset email. Check the address and Auth configuration.');
    }
  };

  return (
    <main className="admin-login">
      <section>
        <img src="/images/logo.png" alt="ZA International logo" />
        <p className="eyebrow">Secure content workspace</p>
        <h1>Administrator sign in</h1>
        <p>Only accounts with the server-assigned <code>admin</code> custom claim can use this workspace.</p>
        <form onSubmit={signIn}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {message && (
            <p className="form-notice error">
              <AlertTriangle />
              {message}
            </p>
          )}
          <button className="button button-primary" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
          <button className="link-button" type="button" onClick={() => void reset()}>
            Forgot password?
          </button>
        </form>
        <Link className="text-link" to="/">
          <ChevronLeft size={16} /> Return to website
        </Link>
      </section>
    </main>
  );
}

export function DashboardPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    void Promise.all([
      getAdminCollection<Package>('packages'),
      getAdminCollection<Job>('jobs'),
      getAdminCollection<Enquiry>('enquiries', true),
    ])
      .then(([p, j, e]) => {
        setPackages(p);
        setJobs(j);
        setEnquiries(e);
      })
      .catch(() =>
        setError('The dashboard data could not be loaded. Confirm the Firestore rules and administrator claim.')
      );
  }, []);

  const metrics = [
    { label: 'Published packages', value: packages.filter((item) => item.status === 'published').length },
    { label: 'Draft packages', value: packages.filter((item) => item.status === 'draft').length },
    { label: 'Active jobs', value: jobs.filter((item) => item.status === 'published').length },
    { label: 'Closed / draft jobs', value: jobs.filter((item) => item.status !== 'published').length },
    { label: 'New enquiries', value: enquiries.filter((item) => item.status === 'new').length },
    { label: 'Pending attention', value: enquiries.filter((item) => item.status !== 'resolved').length },
  ];

  return (
    <AdminPage title="Overview" subtitle="Live counts and recent content from configured Firestore collections.">
      {error && (
        <p className="form-notice error">
          <AlertTriangle />
          {error}
        </p>
      )}
      <div className="metric-grid">
        {metrics.map((metric) => (
          <article key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </div>

      <div className="admin-panel two">
        <section>
          <h2>Quick actions</h2>
          <div className="quick-actions">
            <Link className="button button-primary" to="/admin/packages">
              <Plus size={16} /> Add / Manage packages
            </Link>
            <Link className="button button-outline" to="/admin/jobs">
              <Plus size={16} /> Add / Manage jobs
            </Link>
            <Link className="button button-secondary" to="/admin/media">
              <UploadCloud size={16} /> Upload media
            </Link>
          </div>
        </section>

        <section>
          <h2>Enquiry queue</h2>
          <p>
            {enquiries.length
              ? `${enquiries.filter((item) => item.status !== 'resolved').length} enquiry records currently need attention.`
              : 'No enquiry records submitted yet.'}
          </p>
          <Link className="text-link" to="/admin/enquiries">
            Open enquiries <Eye size={16} />
          </Link>
        </section>
      </div>

      <div className="admin-panel two" style={{ marginTop: '1.5rem' }}>
        <section>
          <h2>Recent packages</h2>
          {packages.length ? (
            <div className="record-list">
              {packages.slice(0, 4).map((pkg) => (
                <div key={pkg.id} className="record-row">
                  <div>
                    <StatusBadge status={pkg.status} />
                    <strong>{pkg.title}</strong>
                    <small>{pkg.category} · {pkg.duration || 'Duration on request'}</small>
                  </div>
                  <Link className="button button-small button-outline" to="/admin/packages">
                    Edit
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p>No packages in database yet.</p>
          )}
        </section>

        <section>
          <h2>Recent jobs</h2>
          {jobs.length ? (
            <div className="record-list">
              {jobs.slice(0, 4).map((job) => (
                <div key={job.id} className="record-row">
                  <div>
                    <StatusBadge status={job.status} />
                    <strong>{job.title}</strong>
                    <small>{job.country} · {job.category}</small>
                  </div>
                  <Link className="button button-small button-outline" to="/admin/jobs">
                    Edit
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p>No jobs added yet. Vacancies remain in "updates coming soon" state.</p>
          )}
        </section>
      </div>
    </AdminPage>
  );
}

export function ManagePackagesPage() {
  const [records, setRecords] = useState<Package[]>([]);
  const [editing, setEditing] = useState<Package | null>(null);
  const [previewing, setPreviewing] = useState<Package | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const load = () => {
    void getAdminCollection<Package>('packages')
      .then(setRecords)
      .catch(() => setError('Could not load packages.'));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    return records.filter((pkg) => {
      const matchesSearch = `${pkg.title} ${pkg.slug} ${pkg.shortDescription}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || pkg.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || pkg.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [records, searchTerm, statusFilter, categoryFilter]);

  const remove = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone from the dashboard.`)) return;
    try {
      await deleteManagedRecord('packages', id);
      setToast('Package deleted successfully.');
      setTimeout(() => setToast(''), 3000);
      load();
    } catch {
      setError('Could not delete this package.');
    }
  };

  return (
    <AdminPage title="Packages" subtitle="Create, edit, publish, close or archive pilgrimage packages.">
      {toast && (
        <p className="form-notice" style={{ background: '#e7f5e9', color: '#135d35', marginBottom: '1rem' }}>
          <CheckCircle2 size={16} /> {toast}
        </p>
      )}
      {error && (
        <p className="form-notice error">
          <AlertTriangle />
          {error}
        </p>
      )}

      {!editing && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <ManagerToolbar label="New package" onNew={() => setEditing(blankPackage())} />
            <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '.4rem', background: 'white', border: '1px solid var(--line)', padding: '0 .6rem' }}>
                <Search size={15} />
                <input
                  type="text"
                  placeholder="Search packages…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ border: 0, outline: 0, padding: '.4rem 0', fontSize: '.84rem' }}
                />
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{ padding: '.4rem .6rem', border: '1px solid var(--line)', background: 'white', fontSize: '.84rem' }}
              >
                <option value="all">All categories</option>
                <option value="umrah">Umrah</option>
                <option value="hajj">Hajj</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '.4rem .6rem', border: '1px solid var(--line)', background: 'white', fontSize: '.84rem' }}
              >
                <option value="all">All statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="closed">Closed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <RecordTable
            records={filtered}
            kind="package"
            onEdit={setEditing}
            onPreview={setPreviewing}
            onDelete={(id) => {
              const item = records.find((r) => r.id === id);
              void remove(id, item?.title || 'package');
            }}
          />
        </>
      )}

      {editing && (
        <PackageEditor
          record={editing}
          onCancel={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            setToast('Package saved successfully.');
            setTimeout(() => setToast(''), 3000);
            load();
          }}
          onPreview={(pkg) => setPreviewing(pkg)}
        />
      )}

      {previewing && (
        <PackagePreviewModal
          pkg={previewing}
          onClose={() => setPreviewing(null)}
        />
      )}
    </AdminPage>
  );
}

export function ManageJobsPage() {
  const [records, setRecords] = useState<Job[]>([]);
  const [editing, setEditing] = useState<Job | null>(null);
  const [previewing, setPreviewing] = useState<Job | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const load = () => {
    void getAdminCollection<Job>('jobs')
      .then(setRecords)
      .catch(() => setError('Could not load job listings.'));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    return records.filter((job) => {
      const matchesSearch = `${job.title} ${job.country} ${job.description}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [records, searchTerm, statusFilter]);

  const remove = async (id: string, title: string) => {
    if (!window.confirm(`Delete job "${title}"? This cannot be undone from the dashboard.`)) return;
    try {
      await deleteManagedRecord('jobs', id);
      setToast('Job deleted successfully.');
      setTimeout(() => setToast(''), 3000);
      load();
    } catch {
      setError('Could not delete this job listing.');
    }
  };

  return (
    <AdminPage title="Jobs" subtitle="Publish genuine vacancies with clear requirements and a truthful status.">
      {toast && (
        <p className="form-notice" style={{ background: '#e7f5e9', color: '#135d35', marginBottom: '1rem' }}>
          <CheckCircle2 size={16} /> {toast}
        </p>
      )}
      {error && (
        <p className="form-notice error">
          <AlertTriangle />
          {error}
        </p>
      )}

      {!editing && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <ManagerToolbar label="New job" onNew={() => setEditing(blankJob())} />
            <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '.4rem', background: 'white', border: '1px solid var(--line)', padding: '0 .6rem' }}>
                <Search size={15} />
                <input
                  type="text"
                  placeholder="Search jobs…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ border: 0, outline: 0, padding: '.4rem 0', fontSize: '.84rem' }}
                />
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '.4rem .6rem', border: '1px solid var(--line)', background: 'white', fontSize: '.84rem' }}
              >
                <option value="all">All statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="closed">Closed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <RecordTable
            records={filtered}
            kind="job"
            onEdit={setEditing}
            onPreview={setPreviewing}
            onDelete={(id) => {
              const item = records.find((r) => r.id === id);
              void remove(id, item?.title || 'job');
            }}
          />
        </>
      )}

      {editing && (
        <JobEditor
          record={editing}
          onCancel={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            setToast('Job saved successfully.');
            setTimeout(() => setToast(''), 3000);
            load();
          }}
          onPreview={(job) => setPreviewing(job)}
        />
      )}

      {previewing && (
        <JobPreviewModal
          job={previewing}
          onClose={() => setPreviewing(null)}
        />
      )}
    </AdminPage>
  );
}

export function EnquiriesPage() {
  const [records, setRecords] = useState<Enquiry[]>([]);
  const [editing, setEditing] = useState<Enquiry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const load = () => {
    void getAdminCollection<Enquiry>('enquiries', true)
      .then(setRecords)
      .catch(() => setError('Could not load enquiries. Check the Firestore rules.'));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    return records.filter((item) => {
      const query = `${item.name} ${item.phone} ${item.email || ''} ${item.message}`.toLowerCase();
      const matchesSearch = query.includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCat;
    });
  }, [records, searchTerm, statusFilter, categoryFilter]);

  const save = async () => {
    if (!editing) return;
    try {
      await updateEnquiry(editing.id, editing.status, editing.internalNotes || '');
      setEditing(null);
      setToast('Enquiry updated.');
      setTimeout(() => setToast(''), 3000);
      load();
    } catch {
      setError('Could not save the enquiry status.');
    }
  };

  const removeEnquiry = async (id: string, name: string) => {
    if (!window.confirm(`Delete enquiry from "${name}"?`)) return;
    try {
      await deleteManagedRecord('enquiries', id);
      if (editing?.id === id) setEditing(null);
      setToast('Enquiry deleted.');
      setTimeout(() => setToast(''), 3000);
      load();
    } catch {
      setError('Could not delete enquiry.');
    }
  };

  return (
    <AdminPage title="Enquiries" subtitle="Private visitor enquiries. Handle all data in strict compliance with privacy standards.">
      {toast && (
        <p className="form-notice" style={{ background: '#e7f5e9', color: '#135d35', marginBottom: '1rem' }}>
          <CheckCircle2 size={16} /> {toast}
        </p>
      )}
      {error && (
        <p className="form-notice error">
          <AlertTriangle />
          {error}
        </p>
      )}

      {editing ? (
        <section className="editor-card">
          <button className="link-button" type="button" onClick={() => setEditing(null)}>
            <ChevronLeft size={16} /> Back to enquiries
          </button>
          <h2>{editing.name}</h2>
          <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap', margin: '.5rem 0 1.2rem' }}>
            <a
              className="button button-small button-outline"
              href={`tel:${editing.phone.replace(/\s/g, '')}`}
            >
              <Phone size={14} /> Call {editing.phone}
            </a>
            <a
              className="button button-small button-primary"
              href={`https://wa.me/${editing.phone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={14} /> Open WhatsApp
            </a>
            {editing.email && (
              <a className="button button-small button-ghost" href={`mailto:${editing.email}`} style={{ color: 'var(--forest)', borderColor: 'var(--line)' }}>
                Email {editing.email}
              </a>
            )}
            <button
              className="button button-small button-outline danger"
              type="button"
              onClick={() => void removeEnquiry(editing.id, editing.name)}
            >
              <Trash2 size={14} /> Delete enquiry
            </button>
          </div>

          <p><strong>Category:</strong> {editing.category}</p>
          {editing.selectedItem && <p><strong>Specific interest:</strong> {editing.selectedItem}</p>}
          {editing.travelDate && <p><strong>Preferred travel date:</strong> {editing.travelDate}</p>}
          <p><strong>Message:</strong> {editing.message}</p>

          <label className="field" style={{ marginTop: '1.2rem' }}>
            <span>Status</span>
            <select
              value={editing.status}
              onChange={(e) => setEditing({ ...editing, status: e.target.value as Enquiry['status'] })}
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="in_progress">In progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </label>

          <label className="field">
            <span>Internal team notes</span>
            <textarea
              rows={5}
              value={editing.internalNotes || ''}
              onChange={(e) => setEditing({ ...editing, internalNotes: e.target.value })}
              placeholder="Record follow-up details, quotes given, or conversation notes here…"
            />
          </label>

          <div style={{ display: 'flex', gap: '.6rem', marginTop: '1rem' }}>
            <button className="button button-primary" onClick={() => void save()}>
              <Save size={16} /> Save notes & status
            </button>
            <button className="button button-outline" type="button" onClick={() => setEditing(null)}>
              Cancel
            </button>
          </div>
        </section>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '.4rem', background: 'white', border: '1px solid var(--line)', padding: '0 .6rem', flex: 1, minWidth: '220px' }}>
              <Search size={15} />
              <input
                type="text"
                placeholder="Search visitor name, phone, message…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ border: 0, outline: 0, padding: '.4rem 0', width: '100%', fontSize: '.84rem' }}
              />
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '.4rem .6rem', border: '1px solid var(--line)', background: 'white', fontSize: '.84rem' }}
            >
              <option value="all">All statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="in_progress">In progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ padding: '.4rem .6rem', border: '1px solid var(--line)', background: 'white', fontSize: '.84rem' }}
            >
              <option value="all">All categories</option>
              <option value="general">General</option>
              <option value="hajj">Hajj</option>
              <option value="umrah">Umrah</option>
              <option value="jobs">Careers</option>
              <option value="travel">Travel</option>
              <option value="documentation">Documentation</option>
            </select>
          </div>

          <div className="record-list">
            {filtered.length ? (
              filtered.map((record) => (
                <button className="enquiry-row" key={record.id} type="button" onClick={() => setEditing(record)}>
                  <span>
                    <strong>{record.name}</strong>
                    <small>
                      {record.category} · {record.phone} {record.selectedItem ? `· ${record.selectedItem}` : ''}
                    </small>
                  </span>
                  <StatusBadge
                    status={
                      record.status === 'in_progress'
                        ? 'draft'
                        : record.status === 'contacted'
                        ? 'published'
                        : record.status === 'resolved'
                        ? 'archived'
                        : 'closed'
                    }
                  />
                </button>
              ))
            ) : (
              <EmptyAdmin text="No enquiry records match your filter." />
            )}
          </div>
        </>
      )}
    </AdminPage>
  );
}

export function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void getSiteSettings()
      .then((remote) => {
        if (remote) setSettings(remote);
      })
      .catch(() => setMessage('Using local contact settings until saved to Firestore.'));
  }, []);

  const change = (key: keyof SiteSettings, value: string | string[]) => setSettings({ ...settings, [key]: value });

  const save = async () => {
    setBusy(true);
    setMessage('');
    try {
      await saveSiteSettings(settings);
      setMessage('Site settings saved successfully to Firestore.');
    } catch {
      setMessage('Could not save site settings. Check Firestore rules.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminPage
      title="Site settings"
      subtitle="Public contact details, phone numbers, and map configuration. Never put secrets here."
    >
      <section className="editor-card settings-form">
        <div className="form-row">
          <TextInput label="Company name" value={settings.companyName} onChange={(v) => change('companyName', v)} />
          <TextInput label="Proprietor" value={settings.proprietor} onChange={(v) => change('proprietor', v)} />
        </div>
        <div className="form-row">
          <TextInput
            label="Primary phone"
            value={settings.phones[0] || ''}
            onChange={(v) => change('phones', [v, settings.phones[1] || ''])}
          />
          <TextInput
            label="Secondary phone"
            value={settings.phones[1] || ''}
            onChange={(v) => change('phones', [settings.phones[0] || '', v])}
          />
        </div>
        <div className="form-row">
          <TextInput
            label="WhatsApp number (digits only, e.g. 918877385139)"
            value={settings.whatsapp}
            onChange={(v) => change('whatsapp', v)}
          />
          <TextInput label="Email" value={settings.email} onChange={(v) => change('email', v)} />
        </div>
        <TextInput label="Office address" value={settings.address} onChange={(v) => change('address', v)} />
        <TextAreaInput
          label="Google Maps embed URL"
          value={settings.mapEmbedUrl}
          onChange={(v) => change('mapEmbedUrl', v)}
        />
        <TextInput
          label="Google Maps directions URL"
          value={settings.mapDirectionsUrl}
          onChange={(v) => change('mapDirectionsUrl', v)}
        />
        {message && <p className="form-notice">{message}</p>}
        <button className="button button-primary" disabled={busy} onClick={() => void save()}>
          <Save size={16} /> {busy ? 'Saving…' : 'Save settings'}
        </button>
      </section>
    </AdminPage>
  );
}

export function MediaPage() {
  const [files, setFiles] = useState<{ name: string; url: string }[]>([]);
  const [alt, setAlt] = useState('');
  const [selected, setSelected] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [copiedName, setCopiedName] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);

  const load = async () => {
    try {
      const listed = await listAll(ref(firebaseServices().storage, 'media'));
      setFiles(
        await Promise.all(
          listed.items.map(async (item) => ({
            name: item.name,
            url: await getDownloadURL(item),
          }))
        )
      );
    } catch {
      setMessage('Could not load media. Configure Storage rules and ensure admin is authenticated.');
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const upload = () => {
    if (!selected) {
      setMessage('Choose an image first.');
      return;
    }
    if (!selected.type.startsWith('image/') || selected.size > 5 * 1024 * 1024) {
      setMessage('Choose a JPEG, PNG, or WebP image under 5 MB.');
      return;
    }
    const safe = selected.name.toLowerCase().replace(/[^a-z0-9._-]/g, '-');
    const task = uploadBytesResumable(ref(firebaseServices().storage, `media/${Date.now()}-${safe}`), selected, {
      contentType: selected.type,
      customMetadata: { alt: alt.slice(0, 150) },
    });
    task.on(
      'state_changed',
      (snapshot) => setProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)),
      () => setMessage('Upload failed. Please try again.'),
      () => {
        setMessage('Image uploaded. Copy its URL into a package below.');
        setSelected(null);
        setAlt('');
        setProgress(null);
        void load();
      }
    );
  };

  const copyUrl = (name: string, url: string) => {
    if (navigator?.clipboard) {
      void navigator.clipboard.writeText(url);
      setCopiedName(name);
      setTimeout(() => setCopiedName(null), 2500);
    }
  };

  const remove = async (name: string) => {
    if (!window.confirm('Remove this media file? Verify it is not referenced by a published package first.')) return;
    try {
      await deleteObject(ref(firebaseServices().storage, `media/${name}`));
      await load();
    } catch {
      setMessage('Could not remove this media file.');
    }
  };

  return (
    <AdminPage
      title="Media library"
      subtitle="Upload web-ready JPEG, PNG, or WebP images (< 5 MB). Click 'Copy URL' to paste into packages."
    >
      <section className="editor-card">
        <div className="form-row">
          <label className="field">
            <span>Image file (max 5 MB)</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setSelected(e.target.files?.[0] || null)}
            />
          </label>
          <TextInput label="Alternative text (accessibility description)" value={alt} onChange={setAlt} />
        </div>
        {progress !== null && <p className="form-notice">Uploading {progress}%…</p>}
        {message && <p className="form-notice">{message}</p>}
        <button className="button button-primary" onClick={upload}>
          <UploadCloud size={16} /> Upload image
        </button>
      </section>

      <div className="media-grid">
        {files.map((file) => (
          <article key={file.name}>
            <img src={file.url} alt="" loading="lazy" />
            <p>{file.name}</p>
            <div style={{ display: 'flex', gap: '.4rem', padding: '0 .75rem', marginTop: '.4rem' }}>
              <button
                className="button button-small button-outline"
                type="button"
                onClick={() => copyUrl(file.name, file.url)}
              >
                {copiedName === file.name ? <Check size={14} /> : <Copy size={14} />}
                {copiedName === file.name ? 'Copied!' : 'Copy URL'}
              </button>
              <a className="button button-small button-ghost" href={file.url} target="_blank" rel="noreferrer" style={{ color: 'var(--forest)' }}>
                <ExternalLink size={14} />
              </a>
            </div>
            <button className="link-button danger" type="button" onClick={() => void remove(file.name)}>
              <Trash2 size={14} /> Remove
            </button>
          </article>
        ))}
      </div>
    </AdminPage>
  );
}

function PackageEditor({
  record,
  onSaved,
  onCancel,
  onPreview,
}: {
  record: Package;
  onSaved: () => void;
  onCancel: () => void;
  onPreview: (record: Package) => void;
}) {
  const [value, setValue] = useState(record);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!value.title.trim() || !value.slug.trim()) {
      setMessage('Title and URL slug are required.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      await savePackage(value);
      onSaved();
    } catch {
      setMessage('Could not save this package. Check Firestore rules and values.');
    } finally {
      setBusy(false);
    }
  };

  const handleTitleChange = (t: string) => {
    const autoSlug = !record.slug || record.slug === slugify(record.title);
    setValue({
      ...value,
      title: t,
      slug: autoSlug ? slugify(t) : value.slug,
    });
  };

  return (
    <section className="editor-card">
      <button className="link-button" type="button" onClick={onCancel}>
        <ChevronLeft size={16} /> Back to packages
      </button>
      <h2>{record.title ? `Edit: ${record.title}` : 'Create new package'}</h2>

      <div className="form-row">
        <TextInput label="Title" value={value.title} onChange={handleTitleChange} />
        <TextInput label="URL slug" value={value.slug} onChange={(v) => setValue({ ...value, slug: slugify(v) })} />
      </div>

      <div className="form-row">
        <SelectInput
          label="Category"
          value={value.category}
          options={[
            ['umrah', 'Umrah'],
            ['hajj', 'Hajj'],
          ]}
          onChange={(v) => setValue({ ...value, category: v as Package['category'] })}
        />
        <SelectInput
          label="Publishing status"
          value={value.status}
          options={publishOptions.map((item) => [item.value, item.label])}
          onChange={(v) => setValue({ ...value, status: v as Package['status'] })}
        />
      </div>

      <TextInput
        label="Short description (card preview)"
        value={value.shortDescription}
        onChange={(v) => setValue({ ...value, shortDescription: v })}
      />
      <TextAreaInput
        label="Full description"
        value={value.description}
        onChange={(v) => setValue({ ...value, description: v })}
      />

      <div className="form-row">
        <TextInput
          label="Featured image URL (e.g. /images/umrah1.png or Storage URL)"
          value={value.featuredImage}
          onChange={(v) => setValue({ ...value, featuredImage: v })}
        />
        <TextInput label="Duration (e.g. 18 days, 20 days)" value={value.duration} onChange={(v) => setValue({ ...value, duration: v })} />
      </div>

      <div className="form-row">
        <TextInput
          label="Price (numeric, optional)"
          type="number"
          value={value.price?.toString() || ''}
          onChange={(v) => setValue({ ...value, price: v ? Number(v) : undefined })}
        />
        <TextInput
          label="Price label (e.g. 'From', 'Legacy price (Quint Share)')"
          value={value.priceLabel || ''}
          onChange={(v) => setValue({ ...value, priceLabel: v })}
        />
      </div>

      <div className="form-row">
        <TextInput label="Currency" value={value.currency} onChange={(v) => setValue({ ...value, currency: v.toUpperCase() })} />
        <TextInput
          label="Departure date (optional, e.g. '07 Feb' or '2026-11-15')"
          value={value.departureDate || ''}
          onChange={(v) => setValue({ ...value, departureDate: v })}
        />
      </div>

      <TextInput
        label="Availability note (e.g. 'Enquire to confirm current availability')"
        value={value.availability}
        onChange={(v) => setValue({ ...value, availability: v })}
      />

      <TextAreaInput
        label="Itinerary (one item per line)"
        value={value.itinerary.join('\n')}
        onChange={(v) => setValue({ ...value, itinerary: lines(v) })}
      />
      <TextAreaInput
        label="Inclusions (one item per line)"
        value={value.inclusions.join('\n')}
        onChange={(v) => setValue({ ...value, inclusions: lines(v) })}
      />
      <TextAreaInput
        label="Exclusions & important notes (one item per line)"
        value={value.exclusions.join('\n')}
        onChange={(v) => setValue({ ...value, exclusions: lines(v) })}
      />

      {message && <p className="form-notice">{message}</p>}

      <div className="editor-actions" style={{ marginTop: '1.5rem', display: 'flex', gap: '.6rem' }}>
        <button className="button button-primary" type="button" disabled={busy} onClick={() => void save()}>
          <Save size={16} /> {busy ? 'Saving…' : 'Save package'}
        </button>
        <button className="button button-secondary" type="button" onClick={() => onPreview(value)}>
          <Eye size={16} /> Preview
        </button>
        <button className="button button-outline" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </section>
  );
}

function JobEditor({
  record,
  onSaved,
  onCancel,
  onPreview,
}: {
  record: Job;
  onSaved: () => void;
  onCancel: () => void;
  onPreview: (record: Job) => void;
}) {
  const [value, setValue] = useState(record);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!value.title.trim() || !value.slug.trim() || !value.country.trim()) {
      setMessage('Title, URL slug, and country are required.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      await saveJob(value);
      onSaved();
    } catch {
      setMessage('Could not save this job. Check Firestore rules and values.');
    } finally {
      setBusy(false);
    }
  };

  const handleTitleChange = (t: string) => {
    const autoSlug = !record.slug || record.slug === slugify(record.title);
    setValue({
      ...value,
      title: t,
      slug: autoSlug ? slugify(t) : value.slug,
    });
  };

  return (
    <section className="editor-card">
      <button className="link-button" type="button" onClick={onCancel}>
        <ChevronLeft size={16} /> Back to jobs
      </button>
      <h2>{record.title ? `Edit: ${record.title}` : 'Create new job'}</h2>

      <div className="form-row">
        <TextInput label="Job title" value={value.title} onChange={handleTitleChange} />
        <TextInput label="URL slug" value={value.slug} onChange={(v) => setValue({ ...value, slug: slugify(v) })} />
      </div>

      <div className="form-row">
        <TextInput label="Country" value={value.country} onChange={(v) => setValue({ ...value, country: v })} />
        <TextInput label="Location / City" value={value.location || ''} onChange={(v) => setValue({ ...value, location: v })} />
      </div>

      <div className="form-row">
        <TextInput label="Category (e.g. Hospitality, Healthcare, Technical)" value={value.category} onChange={(v) => setValue({ ...value, category: v })} />
        <SelectInput
          label="Publishing status"
          value={value.status}
          options={publishOptions.map((item) => [item.value, item.label])}
          onChange={(v) => setValue({ ...value, status: v as Job['status'] })}
        />
      </div>

      <div className="form-row">
        <TextInput label="Salary (optional)" value={value.salary || ''} onChange={(v) => setValue({ ...value, salary: v })} />
        <TextInput
          label="Application deadline (optional)"
          type="date"
          value={value.applicationDeadline || ''}
          onChange={(v) => setValue({ ...value, applicationDeadline: v })}
        />
      </div>

      <TextAreaInput label="Job description" value={value.description} onChange={(v) => setValue({ ...value, description: v })} />
      <TextAreaInput
        label="Requirements (one item per line)"
        value={value.requirements.join('\n')}
        onChange={(v) => setValue({ ...value, requirements: lines(v) })}
      />
      <TextAreaInput
        label="Benefits stated (one item per line)"
        value={value.benefits.join('\n')}
        onChange={(v) => setValue({ ...value, benefits: lines(v) })}
      />
      <TextAreaInput
        label="Application instructions"
        value={value.applicationInstructions}
        onChange={(v) => setValue({ ...value, applicationInstructions: v })}
      />

      {message && <p className="form-notice">{message}</p>}

      <div className="editor-actions" style={{ marginTop: '1.5rem', display: 'flex', gap: '.6rem' }}>
        <button className="button button-primary" type="button" disabled={busy} onClick={() => void save()}>
          <Save size={16} /> {busy ? 'Saving…' : 'Save job'}
        </button>
        <button className="button button-secondary" type="button" onClick={() => onPreview(value)}>
          <Eye size={16} /> Preview
        </button>
        <button className="button button-outline" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </section>
  );
}

function RecordTable<T extends Package | Job>({
  records,
  kind,
  onEdit,
  onPreview,
  onDelete,
}: {
  records: T[];
  kind: 'package' | 'job';
  onEdit: (record: T) => void;
  onPreview: (record: T) => void;
  onDelete: (id: string) => void;
}) {
  return records.length ? (
    <div className="record-list">
      {records.map((record) => (
        <article className="record-row" key={record.id}>
          <div>
            <StatusBadge status={record.status} />
            <strong>{record.title}</strong>
            <small>
              {'duration' in record
                ? `${record.category} · ${record.duration || 'Duration on request'}`
                : `${record.country} · ${record.category}`}
            </small>
          </div>
          <div style={{ display: 'flex', gap: '.35rem' }}>
            <button
              className="icon-button"
              type="button"
              onClick={() => onPreview(record)}
              aria-label={`Preview ${record.title}`}
              title="Preview"
            >
              <Eye size={16} />
            </button>
            <button
              className="button button-small button-outline"
              type="button"
              onClick={() => onEdit(record)}
            >
              Edit
            </button>
            <button
              className="icon-button danger"
              type="button"
              onClick={() => onDelete(record.id)}
              aria-label={`Delete ${record.title}`}
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </article>
      ))}
    </div>
  ) : (
    <EmptyAdmin text={`No ${kind === 'package' ? 'packages' : 'jobs'} match your criteria.`} />
  );
}

function PackagePreviewModal({ pkg, onClose }: { pkg: Package; onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 500,
        background: 'rgba(0,0,0,.6)',
        display: 'grid',
        placeItems: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          background: 'white',
          maxWidth: '750px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2rem',
          borderRadius: '4px',
          boxShadow: '0 20px 60px rgba(0,0,0,.3)',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1.2rem', right: '1.2rem', background: 'transparent', border: 0 }}
          aria-label="Close preview"
        >
          <X size={22} />
        </button>
        <p className="eyebrow">{pkg.category} · Preview mode</p>
        <h1 style={{ fontSize: '2rem', marginBottom: '.5rem' }}>{pkg.title || 'Untitled Package'}</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '1.2rem' }}>{pkg.shortDescription}</p>
        <div style={{ padding: '1rem', background: 'var(--mist)', marginBottom: '1.5rem' }}>
          <strong>Status: </strong>
          <StatusBadge status={pkg.status} />
          <span style={{ marginLeft: '1rem' }}>
            <strong>Price: </strong>
            {pkg.price ? `₹${pkg.price.toLocaleString('en-IN')}` : 'On request'}
          </span>
          <span style={{ marginLeft: '1rem' }}>
            <strong>Duration: </strong>
            {pkg.duration || 'N/A'}
          </span>
        </div>
        <h3>Itinerary</h3>
        <ul>{pkg.itinerary.map((i) => <li key={i}>{i}</li>)}</ul>
        <h3>Inclusions</h3>
        <ul>{pkg.inclusions.map((i) => <li key={i}>{i}</li>)}</ul>
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="button button-primary" onClick={onClose}>
            Close preview
          </button>
        </div>
      </div>
    </div>
  );
}

function JobPreviewModal({ job, onClose }: { job: Job; onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 500,
        background: 'rgba(0,0,0,.6)',
        display: 'grid',
        placeItems: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          background: 'white',
          maxWidth: '700px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2rem',
          borderRadius: '4px',
          boxShadow: '0 20px 60px rgba(0,0,0,.3)',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1.2rem', right: '1.2rem', background: 'transparent', border: 0 }}
          aria-label="Close preview"
        >
          <X size={22} />
        </button>
        <p className="eyebrow">{job.country} · Preview mode</p>
        <h1 style={{ fontSize: '2rem', marginBottom: '.5rem' }}>{job.title || 'Untitled Job'}</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '1.2rem' }}>{job.description}</p>
        <div style={{ padding: '1rem', background: 'var(--mist)', marginBottom: '1.5rem' }}>
          <strong>Status: </strong>
          <StatusBadge status={job.status} />
          {job.salary && <span style={{ marginLeft: '1rem' }}><strong>Salary: </strong>{job.salary}</span>}
        </div>
        <h3>Requirements</h3>
        <ul>{job.requirements.map((r) => <li key={r}>{r}</li>)}</ul>
        <h3>Instructions</h3>
        <p>{job.applicationInstructions}</p>
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="button button-primary" onClick={onClose}>
            Close preview
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminPage({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <>
      <header className="admin-page-header">
        <div>
          <p className="eyebrow">Content workspace</p>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </header>
      {children}
    </>
  );
}

function ManagerToolbar({ label, onNew }: { label: string; onNew: () => void }) {
  return (
    <div className="manager-toolbar">
      <button className="button button-primary" type="button" onClick={onNew}>
        <Plus size={16} /> {label}
      </button>
    </div>
  );
}

function EmptyAdmin({ text }: { text: string }) {
  return (
    <div className="empty-admin">
      <ImagePlus size={26} />
      <p>{text}</p>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function TextAreaInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea rows={4} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function SelectInput({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[][];
  onChange: (value: string) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([v, text]) => (
          <option key={v} value={v}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function lines(value: string) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}
