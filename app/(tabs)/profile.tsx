import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileTab() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <SafeAreaView style={styles.center}>
        <Ionicons name="person-circle-outline" size={72} color="#ccc" />
        <Text style={styles.title}>You're browsing as a guest</Text>
        <Text style={styles.subtitle}>Sign in to manage bookings and reservations</Text>
        <TouchableOpacity style={styles.signInBtn} onPress={() => router.push('/login')}>
          <Text style={styles.signInText}>Sign In with Google</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileCard}>
        {user.photo ? (
          <Image source={{ uri: user.photo }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>{user.name[0]}</Text>
          </View>
        )}
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>
      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/bookings')}>
          <Ionicons name="calendar-outline" size={22} color="#2E7D32" />
          <Text style={styles.menuText}>My Bookings</Text>
          <Ionicons name="chevron-forward" size={18} color="#ccc" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
        <Ionicons name="log-out-outline" size={20} color="#e53935" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12, backgroundColor: '#f8f8f8' },
  title: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#888', textAlign: 'center' },
  signInBtn: { backgroundColor: '#2E7D32', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14, marginTop: 8 },
  signInText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  profileCard: { alignItems: 'center', backgroundColor: '#fff', padding: 32, gap: 8 },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#2E7D32', alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: '#fff', fontSize: 32, fontWeight: '700' },
  name: { fontSize: 20, fontWeight: '700', color: '#1a1a1a' },
  email: { fontSize: 14, color: '#888' },
  menu: { backgroundColor: '#fff', marginTop: 16, borderRadius: 16, marginHorizontal: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  menuText: { flex: 1, fontSize: 15, color: '#1a1a1a' },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, margin: 24, padding: 16, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#ffcdd2' },
  signOutText: { color: '#e53935', fontWeight: '600', fontSize: 15 },
});
