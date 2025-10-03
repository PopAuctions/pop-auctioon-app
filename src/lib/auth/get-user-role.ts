import { supabase } from '@/utils/supabase/supabase-store';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { ActionResponse, UserRoles } from '@/types/types';

export const getUserRole = async ({
  id,
}: {
  id: string;
}): Promise<ActionResponse & { role: UserRoles | null }> => {
  const { data, error } = await supabase
    .from('User')
    .select('role')
    .eq('id', id)
    .single();

  if (error || !data) {
    sentryErrorReport(error, `GET_ROLE - ${id}`);
    return {
      error: {
        en: 'Error getting role',
        es: 'Error obteniendo el rol',
      },
      success: null,
      role: null,
    };
  }

  return {
    error: null,
    success: null,
    role: data.role as UserRoles,
  };
};
