import { supabase } from '@/utils/supabase/supabase-store';

export async function getUserRole(userId: string) {
  const { data, error } = await supabase
    .from('User')
    .select('role')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('[getUserRole] Error fetching role:', error);
    return null;
  }
  return data?.role ?? null;
}
