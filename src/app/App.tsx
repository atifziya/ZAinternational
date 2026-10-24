import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { SiteShell } from '../components/SiteShell';
import { AuthProvider } from '../features/auth/AuthProvider';
import {
  AboutPage,
  ContactPage,
  FaqPage,
  JobDetailPage,
  JobsPage,
  NotFoundPage,
  PackageDetailPage,
  PackageListingPage,
  PrivacyPage,
  ServicesPage,
  TermsPage,
  TestimonialsPage,
} from '../pages/ContentPages';
import { HomePage } from '../pages/HomePage';

const AdminGuard = lazy(() => import('../pages/AdminPages').then((m) => ({ default: m.AdminGuard })));
const AdminLoginPage = lazy(() => import('../pages/AdminPages').then((m) => ({ default: m.AdminLoginPage })));
const DashboardPage = lazy(() => import('../pages/AdminPages').then((m) => ({ default: m.DashboardPage })));
const ManagePackagesPage = lazy(() => import('../pages/AdminPages').then((m) => ({ default: m.ManagePackagesPage })));
const ManageJobsPage = lazy(() => import('../pages/AdminPages').then((m) => ({ default: m.ManageJobsPage })));
const EnquiriesPage = lazy(() => import('../pages/AdminPages').then((m) => ({ default: m.EnquiriesPage })));
const MediaPage = lazy(() => import('../pages/AdminPages').then((m) => ({ default: m.MediaPage })));
const SettingsPage = lazy(() => import('../pages/AdminPages').then((m) => ({ default: m.SettingsPage })));

function LazyAdmin({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="admin-loading">Loading workspace…</div>}>
      {children}
    </Suspense>
  );
}

const router = createBrowserRouter([
  {
    path: '/', element: <SiteShell />, errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'hajj', element: <PackageListingPage category="hajj" /> },
      { path: 'umrah', element: <PackageListingPage category="umrah" /> },
      { path: 'packages', element: <PackageListingPage /> },
      { path: 'packages/:slug', element: <PackageDetailPage /> },
      { path: 'jobs', element: <JobsPage /> },
      { path: 'jobs/:slug', element: <JobDetailPage /> },
      { path: 'services', element: <ServicesPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'faq', element: <FaqPage /> },
      { path: 'pilgrimage', element: <TestimonialsPage /> },
      { path: 'privacy-policy', element: <PrivacyPage /> },
      { path: 'terms', element: <TermsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  { path: '/admin/login', element: <LazyAdmin><AdminLoginPage /></LazyAdmin> },
  { path: '/admin', element: <LazyAdmin><AdminGuard><DashboardPage /></AdminGuard></LazyAdmin> },
  { path: '/admin/packages', element: <LazyAdmin><AdminGuard><ManagePackagesPage /></AdminGuard></LazyAdmin> },
  { path: '/admin/jobs', element: <LazyAdmin><AdminGuard><ManageJobsPage /></AdminGuard></LazyAdmin> },
  { path: '/admin/enquiries', element: <LazyAdmin><AdminGuard><EnquiriesPage /></AdminGuard></LazyAdmin> },
  { path: '/admin/media', element: <LazyAdmin><AdminGuard><MediaPage /></AdminGuard></LazyAdmin> },
  { path: '/admin/settings', element: <LazyAdmin><AdminGuard><SettingsPage /></AdminGuard></LazyAdmin> },
]);

export function App() {
  return <ErrorBoundary><AuthProvider><RouterProvider router={router} /></AuthProvider></ErrorBoundary>;
}
