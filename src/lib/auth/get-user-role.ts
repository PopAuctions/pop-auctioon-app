import { supabase } from '@/utils/supabase/supabase-store';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { UserRoles, AsyncResponse } from '@/types/types';

export const getUserRole = async ({
  id,
  accessToken,
}: {
  id: string;
  accessToken: string;
}): Promise<AsyncResponse<{ role: UserRoles; isDisabled: boolean }>> => {
  const { data, error } = await supabase
    .from('User')
    .select('role, isDisabled')
    .eq('id', id)
    .setHeader('Authorization', `Bearer ${accessToken}`)
    .single();

  if (error || !data) {
    sentryErrorReport(error, `GET_ROLE - ${id}`);
    return {
      data: null,
      success: false,
      error: {
        en: 'Error getting role',
        es: 'Error obteniendo el rol',
      },
    };
  }

  return {
    data: {
      role: data.role,
      isDisabled: data.isDisabled,
    },
    success: true,
  };
};
