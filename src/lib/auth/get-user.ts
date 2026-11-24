import { supabase } from '@/utils/supabase/supabase-store';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { User, AsyncResponse } from '@/types/types';
import { createLocalizedMessage } from '@/i18n/api-message';
import type { MessageKey } from '@/i18n';

const USER_LOAD_FAILED = 'errors.auth.userLoadFailed' satisfies MessageKey;

export const getUser = async ({
  id,
}: {
  id: string;
}): Promise<AsyncResponse<User>> => {
  const { data, error } = await supabase
    .from('User')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    sentryErrorReport(error, `GET_USER - ${id}`);
    return {
      data: null,
      success: false,
      error: createLocalizedMessage(USER_LOAD_FAILED),
    };
  }

  return {
    data: data as User,
    success: true,
  };
};
