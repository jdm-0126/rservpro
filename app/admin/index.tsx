import { Villa } from '@/constants/villaData';
import { useVillas } from '@/context/VillaContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminDashboard() {
  const { villas, deleteVilla } = useVillas();
  const router = useRouter();

  const confirmDelete = (villa: Villa) => {
    Alert.alert('Delete Villa', `Are you sure you want to delete "${villa.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteVilla(villa.id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Admin Panel</Text>
          <Text style={styles.subtitle}>Manage villa listings</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/admin/villa-form')}>
          <Ionicons name="add" size={22} color="#fff" />
          <Text style={styles.addBtnText}>Add Villa</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.statsRow}>
        {[
          { label: 'Total Villas', value: villas.length, icon: 'home-outline', color: '#6366f1' },
          { label: 'Avg. Price', value: `₱${villas.length ? Math.round(villas.reduce((s, v) => s + v.price, 0) / villas.length).toLocaleString() : 0}`, icon: 'cash-outline', color: '#2E7D32' },
          { label: 'Total Capacity', value: villas.reduce((s, v) => s + v.guests, 0), icon: 'people-outline', color: '#f59e0b' },
        ].map((s) => (
          <View key={s.label} style={styles.statCard}>
            <Ionicons name={s.icon as any} size={20} color={s.color} />
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>
      <FlatList
        data={villas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="home-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>No villas yet. Add one!</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.cardImage} />
            <View style={styles.cardBody}>
              <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
              <View style={styles.row}>
                <Ionicons name="location-outline" size={13} color="#9ca3af" />
                <Text style={styles.cardMeta}>{item.location}</Text>
              </View>
              <View style={styles.row}>
                <Ionicons name="people-outline" size={13} color="#9ca3af" />
                <Text style={styles.cardMeta}>{item.guests} guests</Text>
                <Ionicons name="bed-outline" size={13} color="#9ca3af" style={{ marginLeft: 8 }} />
                <Text style={styles.cardMeta}>{item.bedrooms} beds</Text>
              </View>
              <Text style={styles.cardPrice}>₱{item.price.toLocaleString()}<Text style={styles.perNight}>/night</Text></Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.availBtn} onPress={() => router.push({ pathname: '/admin/availability', params: { id: item.id } })}>
                <Ionicons name="calendar-outline" size={18} color="#2E7D32" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.editBtn} onPress={() => router.push({ pathname: '/admin/villa-form', params: { id: item.id } })}>
                <Ionicons name="pencil-outline" size={18} color="#6366f1" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => confirmDelete(item)}>
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#f3f4f6' },
  title: { fontSize: 24, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#6366f1', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  statsRow: { flexDirection: 'row', gap: 10, padding: 16 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 12, alignItems: 'center', gap: 4, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4 },
  statValue: { fontSize: 18, fontWeight: '700', color: '#111827' },
  statLabel: { fontSize: 11, color: '#9ca3af', textAlign: 'center' },
  list: { padding: 16, gap: 12 },
  empty: { alignItems: 'center', paddingVertical: 48, gap: 10 },
  emptyText: { fontSize: 15, color: '#9ca3af' },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6 },
  cardImage: { width: 90, height: 110 },
  cardBody: { flex: 1, padding: 12, gap: 4, justifyContent: 'center' },
  cardName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardMeta: { fontSize: 12, color: '#9ca3af' },
  cardPrice: { fontSize: 16, fontWeight: '700', color: '#2E7D32', marginTop: 4 },
  perNight: { fontSize: 12, fontWeight: '400', color: '#9ca3af' },
  actions: { justifyContent: 'center', gap: 8, paddingRight: 12 },
  editBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center' },
  availBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center' },
});
