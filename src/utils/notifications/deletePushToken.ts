import { PROTECTED_ENDPOINTS } from '@/config/api-config';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';

/**
 * 🗑️ Delete push token from database
 *
 * Standalone utility function to delete push token without context dependencies.
 * Called during logout to remove the token from the database.
 *
 * @param token - Expo push token to delete
 * @param protectedPost - Function to make protected API calls
 * @returns Promise<void>
 */
export async function deletePushToken(
  token: string | null,
  protectedPost: (params: any) => Promise<any>
): Promise<void> {
  if (!token) {
    console.log('⚠️ No push token to delete');
    return;
  }

  try {
    console.log('🗑️ Deleting push token from database...');

    const response = await protectedPost({
      endpoint: PROTECTED_ENDPOINTS.NOTIFICATIONS.UNREGISTER,
      data: { token },
    });

    if (response.error) {
      console.error('ERROR_DELETE_PUSH_TOKEN', response.error);
      sentryErrorReport(
        new Error(JSON.stringify(response.error)),
        'DELETE_PUSH_TOKEN_ERROR'
      );
    } else {
      console.log('✅ Push token deleted successfully');
    }
  } catch (error) {
    console.error('ERROR_DELETE_PUSH_TOKEN_CATCH', error);
    sentryErrorReport(error as Error, 'DELETE_PUSH_TOKEN_CATCH_ERROR');
  }
}
