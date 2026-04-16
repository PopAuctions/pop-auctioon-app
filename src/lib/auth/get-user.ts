import { supabase } from '@/utils/supabase/supabase-store';
import { sentryErrorReport } from '@/lib/error/sentry-error-report';
import { User, AsyncResponse } from '@/types/types';

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
      error: {
        en: 'Error getting user',
        es: 'Error obteniendo el usuario',
      },
    };
  }

  return {
    data: data as User,
    success: true,
  };
};
