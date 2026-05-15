import { useAuth } from '@/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Booking = {
  id: string; villaId: string; villaName: string;
  checkIn: string; checkOut: string; guests: number;
  totalPrice: number; status: string;
};

export default function BookingsTab() {
  const { user } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      AsyncStorage.getItem('villa_bookings').then((data) => {
        const all: Booking[] = data ? JSON.parse(data) : [];
        setBookings(all.filter((b) => b.userId === user.id));
      });
    }, [user])
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.center}>
        <Ionicons name="lock-closed-outline" size={48} color="#ccc" />
        <Text style={styles.emptyTitle}>Sign in to view bookings</Text>
        <TouchableOpacity style={styles.signInBtn} onPress={() => router.push('/login')}>
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Bookings</Text>
      {bookings.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="calendar-outline" size={48} color="#ccc" />
          <Text style={styles.emptyTitle}>No bookings yet</Text>
          <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.browseText}>Browse Villas</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.villaName}>{item.villaName}</Text>
                <View style={[styles.badge, item.status === 'confirmed' ? styles.confirmed : styles.pending]}>
                  <Text style={styles.badgeText}>{item.status}</Text>
                </View>
              </View>
              <View style={styles.row}>
                <Ionicons name="calendar-outline" size={14} color="#666" />
                <Text style={styles.meta}>{item.checkIn} → {item.checkOut}</Text>
              </View>
              <View style={styles.row}>
                <Ionicons name="people-outline" size={14} color="#666" />
                <Text style={styles.meta}>{item.guests} guests</Text>
              </View>
              <Text style={styles.total}>${item.totalPrice} total</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  title: { fontSize: 22, fontWeight: '700', padding: 16, color: '#1a1a1a' },
  emptyTitle: { fontSize: 16, color: '#888' },
  browseText: { color: '#2E7D32', fontWeight: '600', fontSize: 15 },
  signInBtn: { backgroundColor: '#2E7D32', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 12 },
  signInText: { color: '#fff', fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 8, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  villaName: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  confirmed: { backgroundColor: '#E8F5E9' },
  pending: { backgroundColor: '#FFF3E0' },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#2E7D32' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  meta: { fontSize: 13, color: '#666' },
  total: { fontSize: 16, fontWeight: '700', color: '#2E7D32', marginTop: 4 },
});
