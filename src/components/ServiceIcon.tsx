import { ContactRound, FileCheck, Landmark, Map, Plane, ScrollText, type LucideProps } from 'lucide-react';

const icons = { Kaaba: Landmark, Passport: ContactRound, Plane, FileCheck, ScrollText, Map };
export function ServiceIcon({ name, ...props }: { name: keyof typeof icons } & LucideProps) {
  const Icon = icons[name];
  return <Icon {...props} />;
}
