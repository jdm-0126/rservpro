import { Villa } from '@/constants/villaData';
import { useAuth } from '@/context/AuthContext';
import { useVillas } from '@/context/VillaContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function VillaCard({ villa, onPress }: { villa: Villa; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: villa.image }} style={styles.cardImage} />
      <View style={styles.cardBody}>
        <Text style={styles.villaName}>{villa.name}</Text>
        <View style={styles.row}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.location}>{villa.location}</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="people-outline" size={14} color="#666" />
          <Text style={styles.meta}>{villa.guests} guests</Text>
          <Ionicons name="bed-outline" size={14} color="#666" style={{ marginLeft: 12 }} />
          <Text style={styles.meta}>{villa.bedrooms} bedrooms</Text>
        </View>
        <Text style={styles.price}>₱{villa.price.toLocaleString()}<Text style={styles.perNight}>/night</Text></Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeTab() {
  const { user } = useAuth();
  const { villas } = useVillas();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] ?? 'Guest'} 👋</Text>
          <Text style={styles.subheading}>Find your perfect villa</Text>
        </View>
        {!user && (
          <TouchableOpacity onPress={() => router.push('/login')} style={styles.signInBtn}>
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={villas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 16 }}
        renderItem={({ item }) => (
          <VillaCard villa={item} onPress={() => router.push(`/villa/${item.id}`)} />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
  greeting: { fontSize: 20, fontWeight: '700', color: '#1a1a1a' },
  subheading: { fontSize: 13, color: '#888', marginTop: 2 },
  signInBtn: { backgroundColor: '#2E7D32', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  signInText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  card: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  cardImage: { width: '100%', height: 200 },
  cardBody: { padding: 14, gap: 6 },
  villaName: { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  location: { fontSize: 13, color: '#666' },
  meta: { fontSize: 13, color: '#666' },
  price: { fontSize: 18, fontWeight: '700', color: '#2E7D32', marginTop: 4 },
  perNight: { fontSize: 13, fontWeight: '400', color: '#888' },
});
