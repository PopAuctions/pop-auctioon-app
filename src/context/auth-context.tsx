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
import type { LangMap, UserRoles } from '@/types/types';
import { getUserRole } from '@/lib/auth/get-user-role';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { ToastVariant } from '@/providers/ToastProvider';

type LoginError =
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_NOT_CONFIRMED'
  | 'USER_NOT_FOUND'
  | 'TOO_MANY_REQUESTS'
  | 'NETWORK_ERROR'
  | 'TOO_MANY_EMAIL_REQUESTS'
  | 'ACCOUNT_DISABLED'
  | 'UNKNOWN_ERROR'
  | 'EMAIL_NOT_VERIFIED'
  | null;

type SignInResult = { success: boolean; message: LangMap; type?: ToastVariant };

export type AuthState =
  | { state: 'loading' }
  | { state: 'unauthenticated' }
  | { state: 'pending'; session: Session }
  | { state: 'authenticated'; session: Session; role: UserRoles | null };

type AuthContextType = {
  isLoading: boolean;
  auth: AuthState;
  getSession: () => [Session | null, UserRoles | null];
  signOut: () => Promise<void>;
  forceLogout: () => Promise<void>;
  signInWithPassword: (args: {
    email: string;
    password: string;
  }) => Promise<SignInResult>;
};

const ACCOUNT_DISABLED_MESSAGE: LangMap = {
  en: 'Your account is deactivated. Please contact support if you think this is a mistake.',
  es: 'Tu cuenta está desactivada. Contacta soporte si crees que es un error.',
};

const AuthContext = createContext<AuthContextType>({
  isLoading: false,
  auth: { state: 'loading' },
  getSession: () => [null, null],
  signOut: async () => {},
  forceLogout: async () => {},
  signInWithPassword: async () => ({
    success: false,
    message: { es: '', en: '' },
    type: undefined,
  }),
});

export const useAuth = () => useContext(AuthContext);

function scheduleRefresh(session: Session | null, onExpire: () => void) {
  const exp = (session?.expires_at ?? 0) * 1000;
  const ms = Math.max(0, exp - Date.now() - 30_000);
  if (!ms || !isFinite(ms)) return null;
  const id = setTimeout(onExpire, ms);
  return () => clearTimeout(id);
}

async function checkIsValidated(session: Session | null): Promise<boolean> {
  if (!session) {
    return false;
  }

  const { data, error } = await supabase
    .from('User')
    .select('emailVerified')
    .eq('id', session.user.id)
    .single();

  if (error) return false;
  return Boolean(data?.emailVerified);
}

const getErrorCode = (error: {
  message: string;
  status?: number;
}): LoginError => {
  // Mapear errores de Supabase a códigos consistentes
  if (error.status === 400) {
    // 400: Credenciales inválidas, email no confirmado, etc.
    if (
      error.message.toLowerCase().includes('email') &&
      error.message.toLowerCase().includes('confirm')
    ) {
      return 'EMAIL_NOT_CONFIRMED';
    }
    // Por defecto, 400 = credenciales inválidas
    return 'INVALID_CREDENTIALS';
  }

  if (error.status === 404) {
    return 'USER_NOT_FOUND';
  }

  if (error.status === 429) {
    return 'TOO_MANY_REQUESTS';
  }

  // Error de red o desconocido
  return 'NETWORK_ERROR';
};

const getErrorMessage = (errorCode: LoginError): LangMap => {
  const errorMessages: Record<Exclude<LoginError, null>, LangMap> = {
    INVALID_CREDENTIALS: {
      es: 'Email o contraseña incorrectos',
      en: 'Invalid email or password',
    },
    EMAIL_NOT_CONFIRMED: {
      es: 'Email no confirmado',
      en: 'Email not confirmed',
    },
    USER_NOT_FOUND: {
      es: 'Email o contraseña incorrectos',
      en: 'Invalid email or password',
    },
    TOO_MANY_REQUESTS: {
      es: 'Demasiados intentos de inicio de sesión. Por favor, intenta más tarde.',
      en: 'Too many login attempts. Please try again later.',
    },
    NETWORK_ERROR: {
      es: 'Error de conexión. Por favor, verifica tu internet.',
      en: 'Connection error. Please check your internet.',
    },
    EMAIL_NOT_VERIFIED: {
      es: 'Correo no verificado. Revisa tu bandeja de entrada.',
      en: 'Email not verified. Check your inbox.',
    },
    TOO_MANY_EMAIL_REQUESTS: {
      en: 'Wait a few moments before requesting another confirmation email.',
      es: 'Espera unos momentos antes de solicitar otro correo de confirmación.',
    },
    ACCOUNT_DISABLED: {
      es: 'Tu cuenta ha sido desactivada. Contacta soporte para más información.',
      en: 'Your account has been disabled. Contact support for more information.',
    },
    UNKNOWN_ERROR: {
      es: 'Error desconocido. Por favor, intenta de nuevo.',
      en: 'Unknown error. Please try again.',
    },
  };

  return errorCode ? errorMessages[errorCode] : { es: '', en: '' };
};

const EMAIL_CONFIRM_COOLDOWN_MS = 120_000;

// UI doesnt refresh when its auctioneer
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useTranslation();
  const { callToast } = useToast(locale);
  const { protectedPost } = useSecureApi();
  const [auth, setAuth] = useState<AuthState>({ state: 'loading' });
  const [manualSignInLoading, setManualSignInLoading] = useState(false);
  const isManualSignInRef = useRef(false);
  const clearTimer = useRef<null | (() => void)>(null);
  const callToastRef = useRef(callToast);
  const disabledToastShownRef = useRef(false);

  const lastConfirmEmailSentAtRef = useRef<Record<string, number>>({});
  const sendConfirmInFlightRef = useRef<Record<string, boolean>>({});

  const isLoading =
    manualSignInLoading || auth.state === 'loading' || auth.state === 'pending';

  const sendEmailConfirmation = useCallback(
    async (email?: string): Promise<LoginError | undefined> => {
      if (!email) return;

      const key = email.trim().toLowerCase();
      const now = Date.now();

      const lastAt = lastConfirmEmailSentAtRef.current[key] ?? 0;
      const inCooldown = now - lastAt < EMAIL_CONFIRM_COOLDOWN_MS;
      const inFlight = sendConfirmInFlightRef.current[key] === true;

      if (inFlight || inCooldown) {
        return 'TOO_MANY_EMAIL_REQUESTS' as const;
      }

      sendConfirmInFlightRef.current[key] = true;

      try {
        const response = await protectedPost<LangMap>({
          endpoint: SECURE_ENDPOINTS.NO_AUTH.REQUEST_EMAIL_CONFIRMATION_TOKEN,
          data: { email: key },
        });

        if (response.error) {
          callToastRef.current({
            variant: 'error',
            description: response.error,
          });
          return null;
        }

        lastConfirmEmailSentAtRef.current[key] = Date.now();
      } catch (e) {
        console.warn('[sendEmailConfirmation] exception:', e);
        return 'UNKNOWN_ERROR';
      } finally {
        sendConfirmInFlightRef.current[key] = false;
      }
    },
    [protectedPost]
  );

  const signOut = useCallback(async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      // optional: log/sentry
      console.warn('[signOut] error:', error.message);
    }
  }, []);

  const forceLogout = useCallback(async () => {
    // 1) Stop refresh timers
    clearTimer.current?.();
    clearTimer.current = null;

    // 2) Reset local auth state FIRST
    setAuth({ state: 'unauthenticated' });

    // 3) Best-effort Supabase cleanup (ignore errors)
    await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
  }, []);

  const logoutBecauseDisabled = useCallback(async () => {
    if (!disabledToastShownRef.current) {
      disabledToastShownRef.current = true;

      callToastRef.current({
        variant: 'error',
        description: ACCOUNT_DISABLED_MESSAGE,
      });
    }

    await forceLogout();
  }, [forceLogout]);

  const getSession = useCallback(() => {
    if (auth.state === 'authenticated') {
      return [auth.session, auth.role] as [Session, UserRoles];
    }

    return [null, null] as [null, null];
  }, [auth]);

  const signInWithPassword = useCallback(
    async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }): Promise<SignInResult> => {
      isManualSignInRef.current = true;
      setManualSignInLoading(true);

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          const code = getErrorCode(error);
          return { success: false, message: getErrorMessage(code) };
        }

        const session = data.session ?? null;
        if (!session) {
          return {
            success: false,
            message: getErrorMessage('UNKNOWN_ERROR'),
          };
        }

        setAuth({ state: 'pending', session });

        const ok = await checkIsValidated(session);
        if (!ok) {
          const result = await sendEmailConfirmation(email);
          await supabase.auth.signOut().catch(() => {});
          setAuth({ state: 'unauthenticated' });
          return {
            success: false,
            message: getErrorMessage(result ?? 'EMAIL_NOT_VERIFIED'),
            type: result === 'TOO_MANY_EMAIL_REQUESTS' ? 'warning' : 'error',
          };
        }

        // Mark authenticated immediately (so UI can move on)
        setAuth({ state: 'authenticated', session, role: null });

        // Fetch role right away for manual sign-in
        try {
          const r = await getUserRole({ id: session.user.id });

          if (r.data?.isDisabled) {
            await logoutBecauseDisabled();
            return {
              success: false,
              message: getErrorMessage('ACCOUNT_DISABLED'),
              type: 'error',
            };
          }

          setAuth({
            state: 'authenticated',
            session,
            role: r.data?.role ?? null,
          });
        } catch (e) {
          console.warn('[signInWithPassword] getUserRole failed:', e);
          await forceLogout();
          return {
            success: false,
            message: getErrorMessage('UNKNOWN_ERROR'),
            type: 'error',
          };
        }

        return {
          success: true,
          message: { es: 'Sesión iniciada', en: 'Session started' },
        };
      } finally {
        setManualSignInLoading(false);
        isManualSignInRef.current = false;
      }
    },
    [sendEmailConfirmation, logoutBecauseDisabled, forceLogout]
  );

  useEffect(() => {
    callToastRef.current = callToast;
  }, [callToast]);

  useEffect(() => {
    disabledToastShownRef.current = false;
  }, [locale]);

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

      setAuth({ state: 'pending', session: sess0 });

      const provider0 = sess0.user.app_metadata?.provider;

      // Only enforce custom email verification for email/password users
      if (provider0 === 'email') {
        const ok = await checkIsValidated(sess0);
        if (!alive) return;

        if (!ok) {
          await forceLogout();
          return;
        }
      }

      // now you can proceed as authenticated
      setAuth({ state: 'authenticated', session: sess0, role: null });

      const session = sess0;

      clearTimer.current?.();
      clearTimer.current = scheduleRefresh(session, async () => {
        const { data, error } = await supabase.auth.refreshSession();

        // Sign out only if refresh failed OR returned no session
        if (error || !data.session) {
          await forceLogout();
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
        await forceLogout();
        return;
      }

      // ✅ Disabled guard + role fetch ONCE (reuse the result below)
      let roleFromDb: any = null;

      try {
        const r = await getUserRole({ id: u.user.id });
        if (!alive) return;

        if (r.data?.isDisabled) {
          await logoutBecauseDisabled();
          return;
        }

        roleFromDb = r.data?.role ?? null;
      } catch {
        await forceLogout();
        return;
      }

      // ✅ Reuse the role we already fetched (no second getUserRole call)
      const { data: s2 } = await supabase.auth.getSession();
      const sess = s2.session ?? sess0;

      if (!sess) {
        await forceLogout();
        return;
      }

      setAuth({
        state: 'authenticated',
        session: sess,
        role: roleFromDb,
      });
    })();

    // 3) Subscribe to auth changes
    const { data: sub } = supabase.auth.onAuthStateChange(
      async (ev, newSession) => {
        if (!alive) return;

        if (ev === 'SIGNED_OUT') {
          setAuth({ state: 'unauthenticated' });
          clearTimer.current?.();
          clearTimer.current = null;
          return;
        }

        if (ev === 'SIGNED_IN' && isManualSignInRef.current) return;
        if (ev !== 'SIGNED_IN' && ev !== 'TOKEN_REFRESHED') return;

        if (!newSession) {
          setAuth({ state: 'unauthenticated' });
          return;
        }

        const provider = newSession.user.app_metadata?.provider;

        // ✅ OAuth sign-ins: skip custom email verification gate
        if (provider && provider !== 'email') {
          setAuth((prev) => ({
            state: 'authenticated',
            session: newSession,
            role: prev.state === 'authenticated' ? prev.role : null,
          }));

          // schedule refresh
          clearTimer.current?.();
          clearTimer.current = scheduleRefresh(newSession, () => {});

          // fetch role in background
          (async () => {
            try {
              const r = await getUserRole({ id: newSession.user.id });
              if (!alive) return;

              if (r.data?.isDisabled) {
                await logoutBecauseDisabled();
                return;
              }

              setAuth({
                state: 'authenticated',
                session: newSession,
                role: r.data?.role ?? null,
              });
            } catch (e) {
              console.log('[AuthProvider] getUserRole failed:', e);
            }
          })();

          return; // ✅ important
        }

        // Email/password sessions continue with verification gate
        setAuth({ state: 'pending', session: newSession });

        clearTimer.current?.();
        clearTimer.current = scheduleRefresh(newSession, () => {});

        const ok = await checkIsValidated(newSession);
        if (!alive) return;

        if (!ok) {
          clearTimer.current?.();
          clearTimer.current = null;
          await forceLogout();
          return;
        }

        setAuth((prev) => ({
          state: 'authenticated',
          session: newSession,
          role: prev.state === 'authenticated' ? prev.role : null,
        }));

        (async () => {
          try {
            const r = await getUserRole({ id: newSession.user.id });
            if (!alive) return;

            if (r.data?.isDisabled) {
              await logoutBecauseDisabled();
              return;
            }

            setAuth({
              state: 'authenticated',
              session: newSession,
              role: r.data?.role ?? null,
            });
          } catch (e) {
            console.log('[AuthProvider] getUserRole failed:', e);
          }
        })();
      }
    );

    return () => {
      alive = false;
      sub?.subscription.unsubscribe();
      clearTimer.current?.();
    };
  }, [logoutBecauseDisabled, forceLogout]);

  const value = useMemo(
    () => ({
      auth,
      getSession,
      signOut,
      forceLogout,
      signInWithPassword,
      isLoading,
    }),
    [auth, getSession, signInWithPassword, signOut, forceLogout, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
