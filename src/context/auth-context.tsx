import { createContext, useContext } from 'react';
import { Session } from '@supabase/supabase-js';
import { UserRoles } from '@/types/types';

type AuthContextType = {
  session: Session | null;
  role: UserRoles | null;
};

export const AuthContext = createContext<AuthContextType>({
  session: null,
  role: null,
});

export const useAuth = () => useContext(AuthContext);
