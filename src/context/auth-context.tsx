import { createContext, useContext } from 'react';
import { Session } from '@supabase/supabase-js';

type AuthContextType = {
  session: Session | null;
  role: string | null;
};

export const AuthContext = createContext<AuthContextType>({
  session: null,
  role: null,
});

export const useAuth = () => useContext(AuthContext);
