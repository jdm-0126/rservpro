import { useAuth } from '@/context/AuthContext';
import { Redirect, Stack } from 'expo-router';

export default function AdminLayout() {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Redirect href="/(tabs)" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="villa-form" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
