import { BarChart3, BriefcaseBusiness, FileQuestion, Image, LogOut, Menu, PackageOpen, Settings, X } from 'lucide-react';
import { useState, type PropsWithChildren } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthProvider';

const links = [
  ['/admin', 'Overview', BarChart3], ['/admin/packages', 'Packages', PackageOpen], ['/admin/jobs', 'Jobs', BriefcaseBusiness], ['/admin/enquiries', 'Enquiries', FileQuestion], ['/admin/media', 'Media library', Image], ['/admin/settings', 'Site settings', Settings],
] as const;

export function AdminLayout({ children }: PropsWithChildren) {
  const { user, signOutUser } = useAuth(); const [open, setOpen] = useState(false);
  return <div className="admin-shell"><header className="admin-mobile-header"><strong>ZA Admin</strong><button type="button" className="menu-button" onClick={() => setOpen(!open)} aria-label="Toggle admin navigation">{open ? <X /> : <Menu />}</button></header><aside className={`admin-sidebar ${open ? 'is-open' : ''}`}><div className="admin-brand"><img src="/images/logo.png" alt="" /><span><strong>ZA International</strong><small>Content workspace</small></span></div><nav>{links.map(([to, label, Icon]) => <NavLink end={to === '/admin'} key={to} to={to} onClick={() => setOpen(false)}><Icon size={18} /> {label}</NavLink>)}</nav><div className="admin-user"><span>{user?.email}</span><button type="button" onClick={() => void signOutUser()}><LogOut size={16} /> Sign out</button></div></aside><main className="admin-main">{children}</main></div>;
}
