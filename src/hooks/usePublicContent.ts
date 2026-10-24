import { useEffect, useState } from 'react';
import { hasFirebaseConfig } from '../firebase/client';
import { getPublicJobs, getPublicPackages } from '../firebase/repository';
import { legacyPackages } from '../data/legacyContent';
import type { Job, Package } from '../types/content';

export function usePackages(category?: Package['category']) {
  const fallback = category ? legacyPackages.filter((item) => item.category === category) : legacyPackages;
  const [items, setItems] = useState<Package[]>(fallback);
  const [loading, setLoading] = useState(hasFirebaseConfig);
  useEffect(() => {
    let active = true;
    if (!hasFirebaseConfig) return;
    void getPublicPackages(category).then((remote) => { if (active && remote.length) setItems(remote); }).catch(() => undefined).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [category]);
  return { items, loading };
}

export function useJobs() {
  const [items, setItems] = useState<Job[]>([]);
  const [loading, setLoading] = useState(hasFirebaseConfig);
  useEffect(() => {
    let active = true;
    if (!hasFirebaseConfig) return;
    void getPublicJobs().then((remote) => { if (active) setItems(remote); }).catch(() => undefined).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  return { items, loading };
}
