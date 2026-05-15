import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AuthScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = useState<'login' | 'signup'>(params.mode === 'signup' ? 'signup' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const { signInWithGoogle } = useAuth();
  const router = useRouter();
  const isSignup = mode === 'signup';

  const validate = () => {
    const e: Record<string, string> = {};
    if (isSignup && !name.trim()) e.name = 'Full name is required';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      // TODO: wire up Supabase / Firebase auth here
      router.replace('/(tabs)');
    } catch {
      setErrors({ general: 'Authentication failed. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const toggle = () => { setMode((m) => (m === 'login' ? 'signup' : 'login')); setErrors({}); };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#374151" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>{isSignup ? 'Create Account' : 'Sign In'}</Text>
            <Text style={styles.subtitle}>{isSignup ? 'Join Villa Reserve and start booking your dream stays.' : 'Welcome back! Sign in to your account.'}</Text>
          </View>
          <TouchableOpacity style={styles.googleBtn} onPress={signInWithGoogle} activeOpacity={0.85}>
            <Ionicons name="logo-google" size={18} color="#ea4335" />
            <Text style={styles.googleText}>Continue with Google</Text>
          </TouchableOpacity>
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or with email</Text>
            <View style={styles.dividerLine} />
          </View>
          {errors.general && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={16} color="#dc2626" />
              <Text style={styles.errorBannerText}>{errors.general}</Text>
            </View>
          )}
          <View style={styles.form}>
            {isSignup && (
              <View style={styles.field}>
                <Text style={styles.label}>Full Name</Text>
                <View style={[styles.inputWrap, errors.name && styles.inputWrapError]}>
                  <Ionicons name="person-outline" size={18} color="#9ca3af" />
                  <TextInput style={styles.input} placeholder="John Doe" placeholderTextColor="#9ca3af" value={name} onChangeText={(v) => { setName(v); setErrors((e) => ({ ...e, name: '' })); }} autoCapitalize="words" />
                </View>
                {errors.name && <Text style={styles.fieldError}>{errors.name}</Text>}
              </View>
            )}
            <View style={styles.field}>
              <Text style={styles.label}>Email Address</Text>
              <View style={[styles.inputWrap, errors.email && styles.inputWrapError]}>
                <Ionicons name="mail-outline" size={18} color="#9ca3af" />
                <TextInput style={styles.input} placeholder="you@example.com" placeholderTextColor="#9ca3af" value={email} onChangeText={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: '' })); }} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
              </View>
              {errors.email && <Text style={styles.fieldError}>{errors.email}</Text>}
            </View>
            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Password</Text>
                {!isSignup && <TouchableOpacity><Text style={styles.forgotText}>Forgot password?</Text></TouchableOpacity>}
              </View>
              <View style={[styles.inputWrap, errors.password && styles.inputWrapError]}>
                <Ionicons name="lock-closed-outline" size={18} color="#9ca3af" />
                <TextInput style={styles.input} placeholder="Min. 6 characters" placeholderTextColor="#9ca3af" value={password} onChangeText={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: '' })); }} secureTextEntry={!showPassword} />
                <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9ca3af" />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.fieldError}>{errors.password}</Text>}
            </View>
          </View>
          <TouchableOpacity style={[styles.submitBtn, submitting && { opacity: 0.7 }]} onPress={handleSubmit} disabled={submitting} activeOpacity={0.85}>
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>{isSignup ? 'Create Account' : 'Sign In'}</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.toggleRow} onPress={toggle}>
            <Text style={styles.toggleText}>
              {isSignup ? 'Already have an account? ' : "Don't have an account? "}
              <Text style={styles.toggleLink}>{isSignup ? 'Sign In' : 'Sign Up'}</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 24, paddingBottom: 40 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  headerText: { marginBottom: 28 },
  title: { fontSize: 30, fontWeight: '800', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#6b7280', lineHeight: 22 },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 14, paddingVertical: 14, backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  googleText: { fontSize: 15, fontWeight: '600', color: '#111827' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 22 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#f3f4f6' },
  dividerText: { fontSize: 13, color: '#9ca3af' },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fef2f2', borderRadius: 10, padding: 12, marginBottom: 16 },
  errorBannerText: { fontSize: 13, color: '#dc2626', flex: 1 },
  form: { gap: 16 },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151' },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  forgotText: { fontSize: 13, color: '#2E7D32', fontWeight: '600' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#f9fafb', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13 },
  inputWrapError: { borderColor: '#fca5a5', backgroundColor: '#fff5f5' },
  input: { flex: 1, fontSize: 15, color: '#111827' },
  fieldError: { fontSize: 12, color: '#ef4444' },
  submitBtn: { backgroundColor: '#2E7D32', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  toggleRow: { alignItems: 'center', marginTop: 20 },
  toggleText: { fontSize: 14, color: '#6b7280' },
  toggleLink: { color: '#2E7D32', fontWeight: '700' },
});
