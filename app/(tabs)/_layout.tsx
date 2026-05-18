import { useAuth } from '@/context/AuthContext';
import { useBookings } from '@/context/BookingContext';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import ChatAssistant from '@/components/ChatAssistant';

export default function TabLayout() {
  const { isAdmin } = useAuth();
  const { unreadCount } = useBookings();

  return (
    <View style={{ flex: 1 }}>
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
              ? {
                  title: 'Admin',
                  tabBarIcon: ({ color, size }) => (
                    <View>
                      <Ionicons name="shield-outline" size={size} color={color} />
                      {unreadCount > 0 && (
                        <View style={{ position: 'absolute', top: -4, right: -6, backgroundColor: '#ef4444', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 }}>
                          <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{unreadCount}</Text>
                        </View>
                      )}
                    </View>
                  ),
                }
              : { href: null }
          }
        />
      </Tabs>
      <ChatAssistant />
    </View>
  );
}
