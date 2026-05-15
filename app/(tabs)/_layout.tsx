import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  const { isAdmin } = useAuth();

  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#2E7D32' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Villas',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={
          isAdmin
            ? { title: 'Admin', tabBarIcon: ({ color, size }) => <Ionicons name="shield-outline" size={size} color={color} /> }
            : { href: null }
        }
      />
    </Tabs>
  );
}
