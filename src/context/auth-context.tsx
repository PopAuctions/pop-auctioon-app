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
import { useNotification } from '@/context/notification-context';

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
  const { deletePushToken } = useNotification();

  const signOut = async (): Promise<void> => {
    // 🗑️ Delete push token before logout
    try {
      await deletePushToken();
    } catch (error) {
      console.warn('[signOut] Error deleting push token:', error);
      // Continue with logout even if token deletion fails
    }

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
      // 1) Cargar sesión de storage (puede ser null al inicio)
      const { data: s1 } = await supabase.auth.getSession();
      const sess0 = s1.session ?? null;

      // 2) Validar con el servidor (forzará refresh si aplica)
      const { data: u, error } = await supabase.auth.getUser();
      if (!alive) return;

      if (error || !u?.user) {
        await supabase.auth.signOut().catch(() => {});
        setAuth({ state: 'unauthenticated' });
        return;
      }

      // Asegura tener la sesión “actual” tras validar usuario
      const { data: s2 } = await supabase.auth.getSession();
      const sess = s2.session ?? sess0;
      if (!sess) {
        // Usuario OK pero sin session usable -> trata como no autenticado
        await supabase.auth.signOut().catch(() => {});
        setAuth({ state: 'unauthenticated' });
        return;
      }

      const r = await getUserRole({ id: u.user.id });
      const role = r.data;
      setAuth({ state: 'authenticated', session: sess, role });

      // Programar refresh antes de expirar
      clearTimer.current?.();
      clearTimer.current = scheduleRefresh(sess, async () => {
        const { data, error } = await supabase.auth.refreshSession();
        if (error || !data.session) {
          await supabase.auth.signOut().catch(() => {});
          setAuth({ state: 'unauthenticated' });
          return;
        }
        // Revalidar usuario y role tras refresh
        const { data: u2 } = await supabase.auth.getUser();
        const role2 = u2?.user
          ? (await getUserRole({ id: u2.user.id })).data
          : null;

        setAuth({
          state: 'authenticated',
          session: data.session,
          role: role2 as UserRoles | null,
        });

        clearTimer.current?.();
        clearTimer.current = scheduleRefresh(data.session, () => {});
      });
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
          // Verificar usuario y resolver role antes de declarar autenticado
          const { data: u, error } = await supabase.auth.getUser();
          if (error || !u?.user || !newSession) {
            setAuth({ state: 'unauthenticated' });
            return;
          }

          const r = await getUserRole({ id: u.user.id });
          const role = r.data;

          setAuth({ state: 'authenticated', session: newSession, role });

          clearTimer.current?.();
          clearTimer.current = scheduleRefresh(newSession, () => {});
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
