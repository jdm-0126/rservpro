import { useAuth } from '@/context/AuthContext';
import { useBookings } from '@/context/BookingContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, FlatList, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BookingsTab() {
  const { user } = useAuth();
  const { bookings, cancelBooking } = useBookings();
  const router = useRouter();

  const myBookings = bookings
    .filter((b) => b.userId === user?.id)
    .sort((a, b) => b.id.localeCompare(a.id)); // newest first

  const handleCancel = (id: string, villaName: string) => {
    Alert.alert('Cancel Booking', `Cancel your booking at ${villaName}?`, [
      { text: 'Keep', style: 'cancel' },
      { text: 'Cancel Booking', style: 'destructive', onPress: () => cancelBooking(id) },
    ]);
  };

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
      {myBookings.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="calendar-outline" size={48} color="#ccc" />
          <Text style={styles.emptyTitle}>No bookings yet</Text>
          <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.browseText}>Browse Villas</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={myBookings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.villaName}>{item.villaName}</Text>
                <View style={[
                  styles.badge,
                  item.status === 'confirmed' ? styles.confirmed :
                  item.status === 'cancelled' ? styles.cancelled : styles.pending,
                ]}>
                  <Text style={[styles.badgeText, item.status === 'cancelled' && styles.badgeTextCancelled]}>
                    {item.status}
                  </Text>
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
              <View style={styles.cardFooter}>
                <Text style={styles.total}>₱{item.totalPrice.toLocaleString()} total</Text>
                {item.status !== 'cancelled' && (
                  <TouchableOpacity onPress={() => handleCancel(item.id, item.villaName)} style={styles.cancelBtn}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#f8f8f8' },
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  title:       { fontSize: 22, fontWeight: '700', padding: 16, color: '#1a1a1a' },
  emptyTitle:  { fontSize: 16, color: '#888' },
  browseText:  { color: '#2E7D32', fontWeight: '600', fontSize: 15 },
  signInBtn:   { backgroundColor: '#2E7D32', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 12 },
  signInText:  { color: '#fff', fontWeight: '700' },
  card:        { backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 8, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  cardHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  villaName:   { fontSize: 16, fontWeight: '700', color: '#1a1a1a', flex: 1 },
  badge:       { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  confirmed:   { backgroundColor: '#E8F5E9' },
  pending:     { backgroundColor: '#FFF3E0' },
  cancelled:   { backgroundColor: '#fef2f2' },
  badgeText:   { fontSize: 12, fontWeight: '600', color: '#2E7D32' },
  badgeTextCancelled: { color: '#ef4444' },
  row:         { flexDirection: 'row', alignItems: 'center', gap: 6 },
  meta:        { fontSize: 13, color: '#666' },
  cardFooter:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  total:       { fontSize: 16, fontWeight: '700', color: '#2E7D32' },
  cancelBtn:   { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#fca5a5' },
  cancelText:  { fontSize: 13, color: '#ef4444', fontWeight: '600' },
});
