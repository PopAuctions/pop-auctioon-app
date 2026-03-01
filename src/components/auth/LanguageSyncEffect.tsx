import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/auth-context';
import { useTranslationContext } from '@/context/translation-context';
import { useSecureApi } from '@/hooks/api/useSecureApi';
import { SECURE_ENDPOINTS } from '@/config/api-config';
import {
  clearManualLanguageFlag,
  getCurrentLocale,
  getManualLanguageFlag,
} from '@/i18n';
import { Lang, User } from '@/types/types';

type UserWithLanguage = User & { language?: string };

/**
 * Resolves the language conflict on login:
 *
 * - If the user explicitly changed language while logged out (flag set)
 *   → push local value to DB (user intent wins)
 * - Otherwise
 *   → pull DB value to local (sync from another device wins)
 *
 * Must be rendered inside both <TranslationProvider> and <AuthProvider>.
 */
export function LanguageSyncEffect() {
  const { auth } = useAuth();
  const { syncLanguageFromDb } = useTranslationContext();
  const { secureGet, securePatch } = useSecureApi();
  const syncedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (auth.state !== 'authenticated') return;

    const userId = auth.session.user.id;

    // Only sync once per authenticated user session
    if (syncedUserIdRef.current === userId) return;

    const syncLanguage = async () => {
      try {
        // Check if user explicitly changed language while logged out
        const hasManualChange = await getManualLanguageFlag();

        if (hasManualChange) {
          // Local value wins — push it to DB so all surfaces stay in sync
          const localLocale = getCurrentLocale() as Lang;

          await securePatch({
            endpoint: SECURE_ENDPOINTS.USER.UPDATE_LANGUAGE,
            data: { language: localLocale },
          });

          // Clear the flag now that it has been persisted to DB
          await clearManualLanguageFlag();
        } else {
          // No local change — DB is authoritative (e.g. changed on another device)
          const response = await secureGet<UserWithLanguage>({
            endpoint: SECURE_ENDPOINTS.USER.CURRENT_USER,
          });

          if (response.error || !response.data) {
            console.error(
              'LANGUAGE_SYNC_EFFECT - Failed to fetch user language',
              response.error
            );
            return;
          }

          const dbLanguage = response.data.language;

          if (dbLanguage === 'es' || dbLanguage === 'en') {
            syncLanguageFromDb(dbLanguage as Lang);
          }
        }

        // Mark as synced for this user session
        syncedUserIdRef.current = userId;
      } catch (error) {
        console.error('LANGUAGE_SYNC_EFFECT - Unexpected error', error);
      }
    };

    syncLanguage();
  }, [auth.state, auth, secureGet, securePatch, syncLanguageFromDb]);

  // This component renders nothing — it's a pure side-effect
  return null;
}
