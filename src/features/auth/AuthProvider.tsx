import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { firebaseServices, hasFirebaseConfig } from '../../firebase/client';

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  configured: boolean;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasFirebaseConfig) { setLoading(false); return; }
    const { auth } = firebaseServices();
    return onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (nextUser) {
        try {
          const token = await nextUser.getIdTokenResult();
          setIsAdmin(token.claims.admin === true);
        } catch { setIsAdmin(false); }
      } else setIsAdmin(false);
      setLoading(false);
    });
  }, []);

  const value = useMemo<AuthState>(() => ({
    user, isAdmin, loading, configured: hasFirebaseConfig,
    signOutUser: async () => { if (hasFirebaseConfig) await signOut(firebaseServices().auth); },
  }), [user, isAdmin, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
