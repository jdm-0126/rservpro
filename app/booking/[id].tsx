import { useAuth } from '@/context/AuthContext';
import { useBookings, expandDateRange } from '@/context/BookingContext';
import { useVillas } from '@/context/VillaContext';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, DateData } from 'react-native-calendars';

// ─── Colour tokens ────────────────────────────────────────────────────────────
const C = {
  booked:    { color: '#ef4444', textColor: '#fff' },   // red  – already booked
  blocked:   { color: '#f97316', textColor: '#fff' },   // orange – admin blocked
  selected:  { color: '#1a1a2e', textColor: '#fff' },   // dark  – user selection
  start:     { color: '#1a1a2e', textColor: '#fff' },
  end:       { color: '#1a1a2e', textColor: '#fff' },
  between:   { color: '#e8e8f0', textColor: '#1a1a2e' },
  today:     { color: '#f0fdf4', textColor: '#2E7D32' },
};

type SelectionState = { checkIn: string | null; checkOut: string | null };

export default function BookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { villas } = useVillas();
  const { addBooking, getBookedDatesForVilla, getBlockedDatesForVilla, isDateRangeAvailable } = useBookings();
  const router = useRouter();

  const villa = villas.find((v) => v.id === id);
  const [selection, setSelection] = useState<SelectionState>({ checkIn: null, checkOut: null });
  const [guests, setGuests] = useState(2);

  const bookedDates  = useMemo(() => new Set(villa ? getBookedDatesForVilla(villa.id)  : []), [villa, getBookedDatesForVilla]);
  const blockedDates = useMemo(() => new Set(villa ? getBlockedDatesForVilla(villa.id) : []), [villa, getBlockedDatesForVilla]);

  // Build markedDates object for react-native-calendars
  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};

    // Booked dates (red)
    bookedDates.forEach((d) => {
      marks[d] = { disabled: true, disableTouchEvent: true, customStyles: { container: { backgroundColor: C.booked.color, borderRadius: 6 }, text: { color: C.booked.textColor, fontWeight: '600' } } };
    });

    // Blocked dates (orange)
    blockedDates.forEach((d) => {
      if (!marks[d]) {
        marks[d] = { disabled: true, disableTouchEvent: true, customStyles: { container: { backgroundColor: C.blocked.color, borderRadius: 6 }, text: { color: C.blocked.textColor, fontWeight: '600' } } };
      }
    });

    // User selection range
    const { checkIn, checkOut } = selection;
    if (checkIn && checkOut) {
      const range = expandDateRange(checkIn, checkOut);
      range.forEach((d, i) => {
        const isStart = i === 0;
        const isEnd   = i === range.length - 1;
        const isMid   = !isStart && !isEnd;
        marks[d] = {
          customStyles: {
            container: {
              backgroundColor: isMid ? C.between.color : C.selected.color,
              borderRadius: isStart ? 20 : isEnd ? 20 : 0,
              borderTopLeftRadius:  isStart ? 20 : 0,
              borderBottomLeftRadius: isStart ? 20 : 0,
              borderTopRightRadius:  isEnd ? 20 : 0,
              borderBottomRightRadius: isEnd ? 20 : 0,
            },
            text: { color: isMid ? C.between.textColor : C.selected.textColor, fontWeight: '700' },
          },
        };
      });
    } else if (checkIn) {
      marks[checkIn] = { customStyles: { container: { backgroundColor: C.selected.color, borderRadius: 20 }, text: { color: '#fff', fontWeight: '700' } } };
    }

    return marks;
  }, [bookedDates, blockedDates, selection]);

  const handleDayPress = (day: DateData) => {
    const date = day.dateString;
    if (bookedDates.has(date) || blockedDates.has(date)) return;

    const { checkIn, checkOut } = selection;

    // Reset if both already selected or tapping before checkIn
    if (!checkIn || (checkIn && checkOut) || date < checkIn) {
      setSelection({ checkIn: date, checkOut: null });
      return;
    }
    // Set checkout — validate no blocked/booked dates in range
    const range = expandDateRange(checkIn, date);
    const hasConflict = range.some((d) => bookedDates.has(d) || blockedDates.has(d));
    if (hasConflict) {
      Alert.alert('Unavailable Dates', 'Your selected range includes unavailable dates. Please choose different dates.');
      setSelection({ checkIn: date, checkOut: null });
      return;
    }
    setSelection({ checkIn, checkOut: date });
  };

  const nights = useMemo(() => {
    if (!selection.checkIn || !selection.checkOut) return 0;
    const d1 = new Date(selection.checkIn), d2 = new Date(selection.checkOut);
    return Math.max(0, Math.round((d2.getTime() - d1.getTime()) / 86400000));
  }, [selection]);

  const total = nights * (villa?.price ?? 0);

  const handleConfirm = async () => {
    if (!villa || !user) return;
    if (!selection.checkIn || !selection.checkOut || nights <= 0) {
      Alert.alert('Select Dates', 'Please tap a check-in date then a check-out date on the calendar.');
      return;
    }
    if (!isDateRangeAvailable(villa.id, selection.checkIn, selection.checkOut)) {
      Alert.alert('Unavailable', 'Some dates in your selection are no longer available.');
      return;
    }
    await addBooking({
      villaId: villa.id,
      villaName: villa.name,
      userId: user.id,
      userName: user.name,
      checkIn: selection.checkIn,
      checkOut: selection.checkOut,
      guests,
      totalPrice: total,
      status: 'confirmed',
    });
    Alert.alert('Booking Confirmed! 🎉', `Your stay at ${villa.name} is confirmed.`, [
      { text: 'View Bookings', onPress: () => router.replace('/(tabs)/bookings') },
    ]);
  };

  if (!villa || !user) return null;

  const today = new Date().toISOString().split('T')[0];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Villa</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Villa info */}
        <Text style={styles.villaName}>{villa.name}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color="#888" />
          <Text style={styles.location}>{villa.location}</Text>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          {[
            { color: C.selected.color, label: 'Your selection' },
            { color: C.booked.color,   label: 'Booked' },
            { color: C.blocked.color,  label: 'Unavailable' },
          ].map((l) => (
            <View key={l.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: l.color }]} />
              <Text style={styles.legendText}>{l.label}</Text>
            </View>
          ))}
        </View>

        {/* Calendar */}
        <View style={styles.calendarCard}>
          <Calendar
            markingType="custom"
            markedDates={markedDates}
            onDayPress={handleDayPress}
            minDate={today}
            enableSwipeMonths
            theme={{
              backgroundColor: '#fff',
              calendarBackground: '#fff',
              textSectionTitleColor: '#888',
              selectedDayBackgroundColor: C.selected.color,
              selectedDayTextColor: '#fff',
              todayTextColor: '#2E7D32',
              dayTextColor: '#1a1a1a',
              textDisabledColor: '#ccc',
              dotColor: C.selected.color,
              arrowColor: '#1a1a2e',
              monthTextColor: '#1a1a1a',
              textDayFontWeight: '500',
              textMonthFontWeight: '700',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 14,
              textMonthFontSize: 16,
            }}
          />
        </View>

        {/* Selection summary */}
        <View style={styles.selectionRow}>
          <View style={styles.selectionBox}>
            <Text style={styles.selectionLabel}>Check-in</Text>
            <Text style={[styles.selectionDate, !selection.checkIn && styles.selectionPlaceholder]}>
              {selection.checkIn ?? 'Tap a date'}
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color="#ccc" />
          <View style={styles.selectionBox}>
            <Text style={styles.selectionLabel}>Check-out</Text>
            <Text style={[styles.selectionDate, !selection.checkOut && styles.selectionPlaceholder]}>
              {selection.checkOut ?? 'Tap a date'}
            </Text>
          </View>
        </View>

        {/* Guests */}
        <View style={styles.guestsCard}>
          <Text style={styles.label}>Guests</Text>
          <View style={styles.guestsRow}>
            <TouchableOpacity
              style={styles.guestBtn}
              onPress={() => setGuests((g) => Math.max(1, g - 1))}
            >
              <Ionicons name="remove" size={18} color="#1a1a2e" />
            </TouchableOpacity>
            <Text style={styles.guestCount}>{guests}</Text>
            <TouchableOpacity
              style={styles.guestBtn}
              onPress={() => setGuests((g) => Math.min(villa.guests, g + 1))}
            >
              <Ionicons name="add" size={18} color="#1a1a2e" />
            </TouchableOpacity>
            <Text style={styles.guestMax}>/ {villa.guests} max</Text>
          </View>
        </View>

        {/* Price summary */}
        {nights > 0 && (
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>₱{villa.price.toLocaleString()} × {nights} night{nights > 1 ? 's' : ''}</Text>
              <Text style={styles.summaryVal}>₱{total.toLocaleString()}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalVal}>₱{total.toLocaleString()}</Text>
            </View>
          </View>
        )}

        {/* Booked by */}
        <View style={styles.guestCard}>
          <Text style={styles.label}>Booked by</Text>
          <Text style={styles.guestName}>{user.name}</Text>
          <Text style={styles.guestEmail}>{user.email}</Text>
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View style={styles.footer}>
        {nights > 0 && (
          <Text style={styles.footerNights}>{nights} night{nights > 1 ? 's' : ''} · ₱{total.toLocaleString()}</Text>
        )}
        <TouchableOpacity
          style={[styles.confirmBtn, (!selection.checkIn || !selection.checkOut) && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          disabled={!selection.checkIn || !selection.checkOut}
        >
          <Text style={styles.confirmText}>Confirm Booking</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#f8f8f8' },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  body:        { padding: 16, gap: 16, paddingBottom: 32 },
  villaName:   { fontSize: 20, fontWeight: '700', color: '#1a1a1a' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  location:    { fontSize: 14, color: '#888' },

  // Legend
  legend:      { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  legendItem:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot:   { width: 12, height: 12, borderRadius: 6 },
  legendText:  { fontSize: 12, color: '#555' },

  // Calendar
  calendarCard: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },

  // Selection row
  selectionRow:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 14, padding: 16, gap: 8 },
  selectionBox:        { flex: 1, alignItems: 'center', gap: 4 },
  selectionLabel:      { fontSize: 11, color: '#aaa', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  selectionDate:       { fontSize: 15, fontWeight: '700', color: '#1a1a2e' },
  selectionPlaceholder:{ color: '#ccc', fontWeight: '400' },

  // Guests
  guestsCard:  { backgroundColor: '#fff', borderRadius: 14, padding: 16, gap: 10 },
  label:       { fontSize: 13, color: '#888', fontWeight: '600' },
  guestsRow:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  guestBtn:    { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f0f0f8', alignItems: 'center', justifyContent: 'center' },
  guestCount:  { fontSize: 20, fontWeight: '700', color: '#1a1a2e', minWidth: 28, textAlign: 'center' },
  guestMax:    { fontSize: 13, color: '#aaa' },

  // Summary
  summary:      { backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 10 },
  summaryRow:   { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontSize: 14, color: '#555' },
  summaryVal:   { fontSize: 14, color: '#1a1a1a', fontWeight: '600' },
  totalRow:     { borderTopWidth: 1, borderColor: '#eee', paddingTop: 10 },
  totalLabel:   { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  totalVal:     { fontSize: 16, fontWeight: '700', color: '#2E7D32' },

  // Guest card
  guestCard:   { backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 4 },
  guestName:   { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  guestEmail:  { fontSize: 13, color: '#888' },

  // Footer
  footer:             { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee', gap: 8 },
  footerNights:       { fontSize: 13, color: '#888', textAlign: 'center' },
  confirmBtn:         { backgroundColor: '#1a1a2e', padding: 16, borderRadius: 14, alignItems: 'center' },
  confirmBtnDisabled: { backgroundColor: '#ccc' },
  confirmText:        { color: '#fff', fontWeight: '700', fontSize: 16 },
});
