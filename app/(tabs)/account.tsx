// app/(tabs)/settings.tsx
import Login from '@/components/auth/login';
import Account from '@/components/account/account';
import { useAuth } from '@/context/auth-context';

export default function AccountTab() {
  const { session, role } = useAuth();
  console.log('[AccountTab]  role:', role);
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
