import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'expo-router';

export default function AdminTab() {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Redirect href="/(tabs)" />;
  return <Redirect href="/admin" />;
}
