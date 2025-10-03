import { supabase } from '@/utils/supabase/supabase-store';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { User, ActionResponse } from '@/types/types';

export const getUser = async ({
  id,
}: {
  id: string;
}): Promise<ActionResponse & { user: User | null }> => {
  const { data, error } = await supabase
    .from('User')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    sentryErrorReport(error, `GET_USER - ${id}`);
    return {
      error: {
        en: 'Error getting user',
        es: 'Error obteniendo el usuario',
      },
      success: null,
      user: null,
    };
  }

  return {
    error: null,
    success: null,
    user: data as User,
  };
};
