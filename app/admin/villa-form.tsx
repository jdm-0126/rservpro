import { Villa } from '@/constants/villaData';
import { useVillas } from '@/context/VillaContext';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const AMENITY_SUGGESTIONS = ['WiFi', 'Pool', 'Air Conditioning', 'BBQ', 'Parking', 'Sea View', 'Garden', 'Fireplace', 'Breakfast', 'Private Chef', 'Gym', 'Spa'];
const EMPTY_FORM = { name: '', location: '', price: '', guests: '', bedrooms: '', description: '', image: '', amenities: [] as string[] };

export default function VillaForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { villas, addVilla, updateVilla } = useVillas();
  const router = useRouter();
  const isEdit = !!id;
  const [form, setForm] = useState(EMPTY_FORM);
  const [customAmenity, setCustomAmenity] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit) {
      const villa = villas.find((v) => v.id === id);
      if (villa) setForm({ name: villa.name, location: villa.location, price: villa.price.toString(), guests: villa.guests.toString(), bedrooms: villa.bedrooms.toString(), description: villa.description, image: villa.image, amenities: [...villa.amenities] });
    }
  }, [id]);

  const set = (key: string, value: string) => { setForm((f) => ({ ...f, [key]: value })); setErrors((e) => ({ ...e, [key]: '' })); };
  const toggleAmenity = (a: string) => setForm((f) => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a] }));
  const addCustomAmenity = () => { const t = customAmenity.trim(); if (!t || form.amenities.includes(t)) return; setForm((f) => ({ ...f, amenities: [...f.amenities, t] })); setCustomAmenity(''); };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.location.trim()) e.location = 'Location is required';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) e.price = 'Enter a valid price';
    if (!form.guests || isNaN(Number(form.guests)) || Number(form.guests) <= 0) e.guests = 'Enter valid guest count';
    if (!form.bedrooms || isNaN(Number(form.bedrooms)) || Number(form.bedrooms) <= 0) e.bedrooms = 'Enter valid bedroom count';
    if (!form.description.trim()) e.description = 'Description is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const payload: Omit<Villa, 'id'> = { name: form.name.trim(), location: form.location.trim(), price: Number(form.price), guests: Number(form.guests), bedrooms: Number(form.bedrooms), description: form.description.trim(), image: form.image.trim() || `https://placehold.co/800x600/6366f1/ffffff?text=${encodeURIComponent(form.name)}`, amenities: form.amenities };
    if (isEdit) { await updateVilla({ ...payload, id: id! }); Alert.alert('Updated', `"${payload.name}" has been updated.`); }
    else { await addVilla(payload); Alert.alert('Added', `"${payload.name}" has been added.`); }
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}><Ionicons name="close" size={24} color="#374151" /></TouchableOpacity>
          <Text style={styles.headerTitle}>{isEdit ? 'Edit Villa' : 'New Villa'}</Text>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}><Text style={styles.saveBtnText}>Save</Text></TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Text style={styles.section}>Basic Info</Text>
          {[{ label: 'Villa Name', key: 'name', placeholder: 'e.g. Azure Cliff Villa' }, { label: 'Location', key: 'location', placeholder: 'e.g. Santorini, Greece' }, { label: 'Image URL', key: 'image', placeholder: 'https://... (optional)' }].map((f) => (
            <View key={f.key} style={styles.field}>
              <Text style={styles.label}>{f.label}</Text>
              <TextInput style={[styles.input, errors[f.key] && styles.inputError]} placeholder={f.placeholder} placeholderTextColor="#9ca3af" value={(form as any)[f.key]} onChangeText={(v) => set(f.key, v)} />
              {errors[f.key] && <Text style={styles.errorText}>{errors[f.key]}</Text>}
            </View>
          ))}
          <Text style={styles.section}>Details</Text>
          <View style={styles.row}>
            {[{ label: 'Price / Night ($)', key: 'price', placeholder: '350' }, { label: 'Max Guests', key: 'guests', placeholder: '8' }, { label: 'Bedrooms', key: 'bedrooms', placeholder: '4' }].map((f) => (
              <View key={f.key} style={[styles.field, styles.fieldThird]}>
                <Text style={styles.label}>{f.label}</Text>
                <TextInput style={[styles.input, errors[f.key] && styles.inputError]} placeholder={f.placeholder} placeholderTextColor="#9ca3af" keyboardType="numeric" value={(form as any)[f.key]} onChangeText={(v) => set(f.key, v)} />
                {errors[f.key] && <Text style={styles.errorText}>{errors[f.key]}</Text>}
              </View>
            ))}
          </View>
          <Text style={styles.section}>Description</Text>
          <View style={styles.field}>
            <TextInput style={[styles.input, styles.textArea, errors.description && styles.inputError]} placeholder="Describe the villa…" placeholderTextColor="#9ca3af" multiline numberOfLines={4} value={form.description} onChangeText={(v) => set('description', v)} />
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          </View>
          <Text style={styles.section}>Amenities</Text>
          <View style={styles.amenitiesGrid}>
            {AMENITY_SUGGESTIONS.map((a) => { const active = form.amenities.includes(a); return (
              <TouchableOpacity key={a} style={[styles.amenityChip, active && styles.amenityChipActive]} onPress={() => toggleAmenity(a)}>
                {active && <Ionicons name="checkmark" size={13} color="#4338ca" />}
                <Text style={[styles.amenityText, active && styles.amenityTextActive]}>{a}</Text>
              </TouchableOpacity>
            ); })}
          </View>
          <View style={styles.customRow}>
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Add custom amenity…" placeholderTextColor="#9ca3af" value={customAmenity} onChangeText={setCustomAmenity} onSubmitEditing={addCustomAmenity} />
            <TouchableOpacity style={styles.customAddBtn} onPress={addCustomAmenity}><Ionicons name="add" size={20} color="#fff" /></TouchableOpacity>
          </View>
          {form.amenities.filter((a) => !AMENITY_SUGGESTIONS.includes(a)).map((a) => (
            <TouchableOpacity key={a} style={[styles.amenityChip, styles.amenityChipActive]} onPress={() => toggleAmenity(a)}>
              <Ionicons name="close" size={13} color="#4338ca" />
              <Text style={[styles.amenityText, styles.amenityTextActive]}>{a}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Ionicons name={isEdit ? 'save-outline' : 'add-circle-outline'} size={20} color="#fff" />
            <Text style={styles.submitText}>{isEdit ? 'Save Changes' : 'Add Villa'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#f3f4f6' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  saveBtn: { backgroundColor: '#6366f1', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  body: { padding: 16, gap: 4, paddingBottom: 40 },
  section: { fontSize: 13, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 16, marginBottom: 8 },
  field: { marginBottom: 12 },
  fieldThird: { flex: 1 },
  row: { flexDirection: 'row', gap: 10 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, fontSize: 14, color: '#111827' },
  inputError: { borderColor: '#f87171' },
  textArea: { height: 100, textAlignVertical: 'top' },
  errorText: { fontSize: 12, color: '#ef4444', marginTop: 4 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  amenityChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff' },
  amenityChipActive: { backgroundColor: '#eef2ff', borderColor: '#c7d2fe' },
  amenityText: { fontSize: 13, color: '#6b7280' },
  amenityTextActive: { color: '#4338ca', fontWeight: '600' },
  customRow: { flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 8 },
  customAddBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#6366f1', padding: 16, borderRadius: 14, marginTop: 16 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
