// app/(tabs)/settings.tsx
import Login from '@/components/auth/login';
import Account from '@/components/account/account';
import { Session } from '@supabase/supabase-js';

type SettingsTabProps = {
  session: Session | null;
  role: string | null;
};

export default function SettingsTab({ session, role }: SettingsTabProps) {
  if (!session) {
    return <Login />;
  }

  return (
    <Account session={session} />
    // Aquí puedes mostrar opciones según el rol
    // Ejemplo:
    // {role === 'AUCTIONEER' ? <AuctioneerMenu /> : <UserMenu />}
  );
}
