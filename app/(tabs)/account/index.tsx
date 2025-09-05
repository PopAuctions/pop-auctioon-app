// app/(tabs)/account/index.tsx
import Login from '../auth/login';
import Account from './account-user';
import { useAuth } from '@/context/auth-context';

export default function AccountTab() {
  const { session } = useAuth();

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
