import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Dimensions, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { height } = Dimensions.get('window');

const FEATURES = [
  { icon: 'search-outline', title: 'Discover', desc: 'Browse curated luxury villas worldwide' },
  { icon: 'calendar-outline', title: 'Book Instantly', desc: 'Reserve in seconds, confirm in minutes' },
  { icon: 'shield-checkmark-outline', title: 'Stay Safe', desc: 'Verified listings and secure payments' },
];

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=900' }}
      style={styles.bg}
      resizeMode="cover"
    >
      <LinearGradient colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.92)']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.logoMark}>
          <Ionicons name="home" size={18} color="#fff" />
          <Text style={styles.logoText}>Villa Reserve</Text>
        </View>
        <View style={styles.hero}>
          <Text style={styles.headline}>Your Dream{'\n'}Stay Awaits</Text>
          <Text style={styles.subheadline}>Handpicked luxury villas in the world's most breathtaking destinations.</Text>
        </View>
        <View style={styles.features}>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.featureCard}>
              <View style={styles.featureIcon}><Ionicons name={f.icon as any} size={18} color="#2E7D32" /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push({ pathname: '/screens/AuthScreen', params: { mode: 'signup' } })} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push({ pathname: '/screens/AuthScreen', params: { mode: 'login' } })} activeOpacity={0.8}>
            <Text style={styles.secondaryBtnText}>I already have an account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, minHeight: height },
  safe: { flex: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12, justifyContent: 'space-between' },
  logoMark: { flexDirection: 'row', alignItems: 'center', gap: 7, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  logoText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  hero: { gap: 12 },
  headline: { fontSize: 46, fontWeight: '800', color: '#fff', lineHeight: 52, letterSpacing: -0.5 },
  subheadline: { fontSize: 16, color: 'rgba(255,255,255,0.72)', lineHeight: 24, maxWidth: '80%' },
  features: { gap: 10 },
  featureCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  featureIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#e8f5e9', alignItems: 'center', justifyContent: 'center' },
  featureTitle: { fontSize: 14, fontWeight: '700', color: '#fff', marginBottom: 2 },
  featureDesc: { fontSize: 12, color: 'rgba(255,255,255,0.65)' },
  actions: { gap: 10, paddingBottom: 8 },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#2E7D32', paddingVertical: 17, borderRadius: 16 },
  primaryBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  secondaryBtn: { alignItems: 'center', paddingVertical: 15, borderRadius: 16, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)' },
  secondaryBtnText: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '600' },
});
