import { useAuth } from '@/context/AuthContext';
import { useVillas } from '@/context/VillaContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { villas } = useVillas();
  const router = useRouter();
  const villa = villas.find((v) => v.id === id);

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');

  if (!villa || !user) return null;

  const nights = (() => {
    const d1 = new Date(checkIn), d2 = new Date(checkOut);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
    return Math.max(0, Math.round((d2.getTime() - d1.getTime()) / 86400000));
  })();

  const total = nights * villa.price;

  const handleConfirm = async () => {
    if (!checkIn || !checkOut || nights <= 0) {
      Alert.alert('Invalid Dates', 'Please enter valid check-in and check-out dates (YYYY-MM-DD).');
      return;
    }
    const booking = {
      id: Date.now().toString(),
      villaId: villa.id, villaName: villa.name,
      userId: user.id, checkIn, checkOut,
      guests: parseInt(guests), totalPrice: total, status: 'confirmed',
    };
    const existing = await AsyncStorage.getItem('villa_bookings');
    const bookings = existing ? JSON.parse(existing) : [];
    bookings.push(booking);
    await AsyncStorage.setItem('villa_bookings', JSON.stringify(bookings));
    Alert.alert('Booking Confirmed! 🎉', `Your stay at ${villa.name} is confirmed.`, [
      { text: 'View Bookings', onPress: () => router.replace('/(tabs)/bookings') },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Villa</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.villaName}>{villa.name}</Text>
        <Text style={styles.location}>{villa.location}</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Check-in Date</Text>
          <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={checkIn} onChangeText={setCheckIn} />
          <Text style={styles.label}>Check-out Date</Text>
          <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={checkOut} onChangeText={setCheckOut} />
          <Text style={styles.label}>Number of Guests (max {villa.guests})</Text>
          <TextInput
            style={styles.input} keyboardType="numeric" value={guests}
            onChangeText={(v) => setGuests(Math.min(parseInt(v) || 1, villa.guests).toString())}
          />
        </View>
        {nights > 0 && (
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>${villa.price} × {nights} nights</Text>
              <Text style={styles.summaryVal}>${total}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalVal}>${total}</Text>
            </View>
          </View>
        )}
        <View style={styles.guestCard}>
          <Text style={styles.label}>Booked by</Text>
          <Text style={styles.guestName}>{user.name}</Text>
          <Text style={styles.guestEmail}>{user.email}</Text>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
          <Text style={styles.confirmText}>Confirm Booking</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  body: { padding: 16, gap: 16 },
  villaName: { fontSize: 20, fontWeight: '700', color: '#1a1a1a' },
  location: { fontSize: 14, color: '#888' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 8 },
  label: { fontSize: 13, color: '#888', fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 15, backgroundColor: '#fafafa' },
  summary: { backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontSize: 14, color: '#555' },
  summaryVal: { fontSize: 14, color: '#1a1a1a', fontWeight: '600' },
  totalRow: { borderTopWidth: 1, borderColor: '#eee', paddingTop: 10 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  totalVal: { fontSize: 16, fontWeight: '700', color: '#2E7D32' },
  guestCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 4 },
  guestName: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  guestEmail: { fontSize: 13, color: '#888' },
  footer: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee' },
  confirmBtn: { backgroundColor: '#2E7D32', padding: 16, borderRadius: 14, alignItems: 'center' },
  confirmText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
