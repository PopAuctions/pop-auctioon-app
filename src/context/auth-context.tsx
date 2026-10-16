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
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/hooks/i18n/useTranslation';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import { ToastVariant } from '@/providers/ToastProvider';
import { AppState, AppStateStatus } from 'react-native';
import { t, type MessageKey } from '@/i18n';
import { resolveApiResponseMessage } from '@/i18n/api-message';
import type { Lang } from '@/i18n/locales';

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

type SignInResult = { success: boolean; message: string; type?: ToastVariant };

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

const AUTH_MESSAGES = {
  INVALID_CREDENTIALS: 'errors.auth.loginInvalidCredentials',
  EMAIL_NOT_CONFIRMED: 'errors.auth.loginEmailNotConfirmed',
  USER_NOT_FOUND: 'errors.auth.loginInvalidCredentials',
  TOO_MANY_REQUESTS: 'errors.auth.loginTooManyRequests',
  NETWORK_ERROR: 'errors.auth.loginNetwork',
  EMAIL_NOT_VERIFIED: 'errors.auth.loginEmailNotVerified',
  TOO_MANY_EMAIL_REQUESTS: 'errors.auth.loginConfirmationCooldown',
  ACCOUNT_DISABLED: 'errors.auth.loginAccountDisabled',
  UNKNOWN_ERROR: 'errors.auth.loginUnknown',
} as const satisfies Record<Exclude<LoginError, null>, MessageKey>;
const ACCOUNT_DISABLED_TOAST =
  'errors.auth.loginAccountDisabledToast' as const satisfies MessageKey;
const SESSION_STARTED =
  'auth.login.sessionStarted' as const satisfies MessageKey;

const AuthContext = createContext<AuthContextType>({
  isLoading: false,
  auth: { state: 'loading' },
  getSession: () => [null, null],
  signOut: async () => {},
  forceLogout: async () => {},
  signInWithPassword: async () => ({
    success: false,
    message: '',
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
    .setHeader('Authorization', `Bearer ${session.access_token}`)
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

const getErrorMessage = (errorCode: LoginError, locale: Lang) =>
  errorCode ? String(t(AUTH_MESSAGES[errorCode], { locale })) : '';

const EMAIL_CONFIRM_COOLDOWN_MS = 120_000;

async function getFreshValidatedSession(): Promise<Session | null> {
  const { data: initial } = await supabase.auth.getSession();
  const currentSession = initial.session ?? null;

  if (!currentSession) return null;

  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return null;
  }

  // Read session again in case getUser() refreshed it internally
  const { data: latest } = await supabase.auth.getSession();
  const refreshedSession = latest.session ?? null;

  if (!refreshedSession) return null;

  if (refreshedSession.user.id !== userData.user.id) {
    return null;
  }

  return refreshedSession;
}

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
        const response = await protectedPost<unknown>({
          endpoint: SECURE_ENDPOINTS.NO_AUTH.REQUEST_EMAIL_CONFIRMATION_TOKEN,
          data: { email: key },
        });

        if (response.error) {
          callToastRef.current({
            variant: 'error',
            description: resolveApiResponseMessage(
              response,
              'error',
              locale,
              'errors.server.connection'
            ),
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
    [locale, protectedPost]
  );

  const resetAuthState = useCallback(() => {
    clearTimer.current?.();
    clearTimer.current = null;
    disabledToastShownRef.current = false;
    setAuth({ state: 'unauthenticated' });
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    resetAuthState();

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.warn('[signOut] error:', error.message);
    }
  }, [resetAuthState]);

  const forceLogout = useCallback(async () => {
    resetAuthState();

    await supabase.auth.signOut({ scope: 'local' }).catch((error) => {
      console.warn('[forceLogout] local signOut error:', error);
    });
  }, [resetAuthState]);

  const armRefresh = useCallback(
    (session: Session, isAlive?: () => boolean) => {
      clearTimer.current?.();

      clearTimer.current = scheduleRefresh(session, async () => {
        const { data, error } = await supabase.auth.refreshSession();
        const refreshedSession = data.session;

        if (error || !refreshedSession) {
          await forceLogout();
          return;
        }

        if (isAlive && !isAlive()) return;

        setAuth((prev) => ({
          state: 'authenticated',
          session: refreshedSession,
          role: prev.state === 'authenticated' ? prev.role : null,
        }));

        armRefresh(refreshedSession, isAlive);
      });
    },
    [forceLogout]
  );

  const logoutBecauseDisabled = useCallback(async () => {
    if (!disabledToastShownRef.current) {
      disabledToastShownRef.current = true;

      callToastRef.current({
        variant: 'error',
        description: ACCOUNT_DISABLED_TOAST,
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
          return { success: false, message: getErrorMessage(code, locale) };
        }

        const session = data.session ?? null;
        if (!session) {
          return {
            success: false,
            message: getErrorMessage('UNKNOWN_ERROR', locale),
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
            message: getErrorMessage(result ?? 'EMAIL_NOT_VERIFIED', locale),
            type: result === 'TOO_MANY_EMAIL_REQUESTS' ? 'warning' : 'error',
          };
        }

        // Mark authenticated immediately (so UI can move on)
        setAuth({ state: 'authenticated', session, role: null });

        // Fetch role right away for manual sign-in
        try {
          const r = await getUserRole({
            id: session.user.id,
            accessToken: session.access_token,
          });

          if (r.data?.isDisabled) {
            await logoutBecauseDisabled();
            return {
              success: false,
              message: getErrorMessage('ACCOUNT_DISABLED', locale),
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
            message: getErrorMessage('UNKNOWN_ERROR', locale),
            type: 'error',
          };
        }

        return {
          success: true,
          message: String(t(SESSION_STARTED, { locale })),
        };
      } finally {
        setManualSignInLoading(false);
        isManualSignInRef.current = false;
      }
    },
    [sendEmailConfirmation, logoutBecauseDisabled, forceLogout, locale]
  );

  const setAuthenticatedWithRole = useCallback(
    async (session: Session, isAlive?: () => boolean) => {
      armRefresh(session, isAlive);

      const r = await getUserRole({
        id: session.user.id,
        accessToken: session.access_token,
      });

      if (isAlive && !isAlive()) return;

      if (r.data?.isDisabled) {
        await logoutBecauseDisabled();
        return;
      }

      setAuth({
        state: 'authenticated',
        session,
        role: r.data?.role ?? null,
      });
    },
    [armRefresh, logoutBecauseDisabled]
  );

  useEffect(() => {
    callToastRef.current = callToast;
  }, [callToast]);

  useEffect(() => {
    disabledToastShownRef.current = false;
  }, [locale]);

  useEffect(() => {
    let alive = true;

    const isAlive = () => alive;

    (async () => {
      const session = await getFreshValidatedSession();

      if (!isAlive()) return;

      if (!session) {
        await forceLogout();
        return;
      }

      const identities = session.user.identities ?? [];
      const providers =
        (session.user.app_metadata?.providers as string[]) ?? [];

      const isOAuth =
        identities.some((i) => i.provider && i.provider !== 'email') ||
        providers.some((p) => p && p !== 'email');

      if (!isOAuth) {
        setAuth({ state: 'pending', session });

        const ok = await checkIsValidated(session);
        if (!isAlive()) return;

        if (!ok) {
          await forceLogout();
          return;
        }
      }

      await setAuthenticatedWithRole(session, isAlive);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (ev, newSession) => {
        if (!isAlive()) return;

        if (ev === 'SIGNED_OUT') {
          resetAuthState();
          return;
        }

        if (ev === 'SIGNED_IN' && isManualSignInRef.current) return;

        if (
          ev !== 'SIGNED_IN' &&
          ev !== 'TOKEN_REFRESHED' &&
          ev !== 'INITIAL_SESSION'
        ) {
          return;
        }

        if (!newSession) {
          resetAuthState();
          return;
        }

        const session = await getFreshValidatedSession();
        if (!isAlive()) return;

        if (!session) {
          await forceLogout();
          return;
        }

        const identities = session.user.identities ?? [];
        const providers =
          (session.user.app_metadata?.providers as string[]) ?? [];

        const isOAuth =
          identities.some((i) => i.provider && i.provider !== 'email') ||
          providers.some((p) => p && p !== 'email');

        if (!isOAuth) {
          setAuth({ state: 'pending', session });

          const ok = await checkIsValidated(session);
          if (!isAlive()) return;

          if (!ok) {
            await forceLogout();
            return;
          }
        }

        await setAuthenticatedWithRole(session, isAlive);
      }
    );

    return () => {
      alive = false;
      sub?.subscription.unsubscribe();
      clearTimer.current?.();
      clearTimer.current = null;
    };
  }, [forceLogout, resetAuthState, setAuthenticatedWithRole]);

  useEffect(() => {
    const sub = AppState.addEventListener(
      'change',
      async (state: AppStateStatus) => {
        if (state !== 'active') return;

        const session = await getFreshValidatedSession();

        if (!session) {
          await forceLogout();
          return;
        }

        const r = await getUserRole({
          id: session.user.id,
          accessToken: session.access_token,
        });

        if (r.data?.isDisabled) {
          await logoutBecauseDisabled();
          return;
        }

        setAuth({
          state: 'authenticated',
          session,
          role: r.data?.role ?? null,
        });
      }
    );

    return () => sub.remove();
  }, [forceLogout, logoutBecauseDisabled]);

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
