import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { supabase } from '@/utils/supabase/supabase-store';
import type { Session } from '@supabase/supabase-js';
import type { UserRoles } from '@/types/types';
import { getUserRole } from '@/lib/auth/get-user-role';

export type AuthState =
  | { state: 'loading' }
  | { state: 'unauthenticated' }
  | { state: 'authenticated'; session: Session; role: UserRoles | null };

type AuthContextType = {
  auth: AuthState;
  getSession: () => [Session | null, UserRoles | null];
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  auth: { state: 'loading' },
  getSession: () => [null, null],
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

function scheduleRefresh(session: Session | null, onExpire: () => void) {
  const exp = (session?.expires_at ?? 0) * 1000;
  const ms = Math.max(0, exp - Date.now() - 30_000);
  if (!ms || !isFinite(ms)) return null;
  const id = setTimeout(onExpire, ms);
  return () => clearTimeout(id);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({ state: 'loading' });
  const clearTimer = useRef<null | (() => void)>(null);

  const signOut = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      // optional: log/sentry
      console.warn('[signOut] error:', error.message);
    }
  };

  const getSession = useCallback(() => {
    if (auth.state === 'authenticated') {
      return [auth.session, auth.role] as [Session, UserRoles];
    }

    return [null, null] as [null, null];
  }, [auth]);

  useEffect(() => {
    let alive = true;

    (async () => {
      // 1) Load session from storage (might exist after OAuth)
      const { data: s1 } = await supabase.auth.getSession();
      const sess0 = s1.session ?? null;

      if (!sess0) {
        setAuth({ state: 'unauthenticated' });
        return;
      }

      const session = sess0;

      setAuth({ state: 'authenticated', session, role: null });

      clearTimer.current?.();
      clearTimer.current = scheduleRefresh(session, async () => {
        const { data, error } = await supabase.auth.refreshSession();
        if (error || data.session) {
          await supabase.auth.signOut().catch(() => {});
          setAuth({ state: 'unauthenticated' });
          return;
        }

        setAuth((prev) => ({
          state: 'authenticated',
          session: data.session!,
          role: prev.state === 'authenticated' ? prev.role : null,
        }));

        clearTimer.current?.();
        clearTimer.current = scheduleRefresh(data.session, () => {});
      });

      // 2) Validate user with server (optional but good)
      const { data: u, error } = await supabase.auth.getUser();
      if (!alive) return;

      if (error || !u?.user) {
        await supabase.auth.signOut().catch(() => {});
        setAuth({ state: 'unauthenticated' });
        return;
      }

      // 3) Fetch role in background (do NOT block auth state)
      (async () => {
        try {
          const r = await getUserRole({ id: u.user.id });
          if (!alive) return;

          // keep latest session from storage (could have been refreshed)
          const { data: s2 } = await supabase.auth.getSession();
          const sess = s2.session ?? sess0;

          if (!sess) {
            await supabase.auth.signOut().catch(() => {});
            setAuth({ state: 'unauthenticated' });
            return;
          }

          setAuth({
            state: 'authenticated',
            session: sess,
            role: r.data ?? null,
          });
        } catch (e) {
          console.log('[AuthProvider] initial getUserRole failed:', e);
          // keep authenticated with role null
        }
      })();
    })();

    // 3) Suscribirse a cambios de auth
    const { data: sub } = supabase.auth.onAuthStateChange(
      async (ev, newSession) => {
        if (!alive) return;

        if (ev === 'SIGNED_OUT') {
          setAuth({ state: 'unauthenticated' });
          clearTimer.current?.();
          clearTimer.current = null;
          return;
        }

        if (ev === 'SIGNED_IN' || ev === 'TOKEN_REFRESHED') {
          if (!newSession) {
            setAuth({ state: 'unauthenticated' });
            return;
          }

          // ✅ set authenticated IMMEDIATELY (no awaits before this)
          setAuth((prev) => {
            const prevRole = prev.state === 'authenticated' ? prev.role : null;
            return {
              state: 'authenticated',
              session: newSession,
              role: prevRole,
            };
          });

          // schedule refresh
          clearTimer.current?.();
          clearTimer.current = scheduleRefresh(newSession, () => {});

          // Fetch role in background (do NOT block auth state)
          (async () => {
            try {
              const userId = newSession.user.id;
              const r = await getUserRole({ id: userId });
              if (!alive) return;
              setAuth({
                state: 'authenticated',
                session: newSession,
                role: r.data ?? null,
              });
            } catch (e) {
              // If role fails, keep authenticated with role null
              console.log('[AuthProvider] getUserRole failed:', e);
            }
          })();

          return;
        }
      }
    );

    return () => {
      alive = false;
      sub?.subscription.unsubscribe();
      clearTimer.current?.();
    };
  }, []);

  const value = useMemo(
    () => ({
      auth,
      getSession,
      signOut,
    }),
    [auth, getSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
