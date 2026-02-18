import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import { Mission, MissionPayload, MissionType } from '../api/missions';
import { useTheme } from '../theme/theme';

type MissionFormProps = {
  initialValues?: Partial<Mission>;
  onSubmit: (values: MissionPayload) => void;
  submitLabel: string;
};

const TYPES: { key: MissionType; label: string }[] = [
  { key: 'nettoyage_plage', label: '🏖️ Nettoyage plage' },
  { key: 'plantation_arbres', label: '🌳 Plantation arbres' },
  { key: 'atelier_zero_dechet', label: '♻️ Zéro déchet' },
  { key: 'sensibilisation', label: '📢 Sensibilisation' },
  { key: 'jardinage_urbain', label: '🌱 Jardinage urbain' },
  { key: 'collecte_dechets', label: '🗑️ Collecte déchets' },
];

export function MissionForm({ initialValues, onSubmit, submitLabel }: MissionFormProps) {
  const { theme } = useTheme();
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [type, setType] = useState<MissionType>(initialValues?.type ?? 'nettoyage_plage');
  const [city, setCity] = useState(initialValues?.city ?? '');
  const [address, setAddress] = useState(initialValues?.address ?? '');
  const [date, setDate] = useState(initialValues?.date ?? new Date().toISOString());
  const [durationHours, setDurationHours] = useState(String(initialValues?.durationHours ?? 2));
  const [slotsTotal, setSlotsTotal] = useState(String(initialValues?.slotsTotal ?? 20));
  const [imageUrl, setImageUrl] = useState(initialValues?.imageUrl ?? '');
  const [organizerName, setOrganizerName] = useState(initialValues?.organizerName ?? '');

  const handleSubmit = () => {
    onSubmit({
      title, description, type, city, address, date,
      durationHours: Number(durationHours),
      slotsTotal: Number(slotsTotal),
      slotsTaken: initialValues?.slotsTaken ?? 0,
      status: initialValues?.status ?? 'open',
      imageUrl, organizerName,
      isUserRegistered: initialValues?.isUserRegistered ?? false,
    });
  };

  const inputStyle = [styles.input, { backgroundColor: theme.colors.inputBg, borderColor: theme.colors.border, color: theme.colors.text }];
  const labelStyle = [styles.label, { color: theme.colors.mutedText }];

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.sectionHeader, { color: theme.colors.text, borderBottomColor: theme.colors.border }]}>
        Informations générales
      </Text>

      <Text style={labelStyle}>Titre *</Text>
      <TextInput style={inputStyle} value={title} onChangeText={setTitle} placeholder="Ex: Nettoyage de la plage" placeholderTextColor={theme.colors.mutedText} />

      <Text style={labelStyle}>Description *</Text>
      <TextInput style={[...inputStyle, styles.textarea]} value={description} onChangeText={setDescription} multiline placeholder="Décrivez la mission..." placeholderTextColor={theme.colors.mutedText} />

      <Text style={labelStyle}>Type de mission *</Text>
      <View style={styles.typeGrid}>
        {TYPES.map((t) => (
          <Pressable
            key={t.key}
            onPress={() => setType(t.key)}
            style={[
              styles.typeChip,
              {
                backgroundColor: type === t.key ? theme.colors.primary : theme.colors.chip,
                borderColor: type === t.key ? theme.colors.primary : theme.colors.border,
              },
            ]}
          >
            <Text style={[styles.typeChipText, { color: type === t.key ? '#fff' : theme.colors.text }]}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.sectionHeader, { color: theme.colors.text, borderBottomColor: theme.colors.border, marginTop: 16 }]}>
        Lieu & Date
      </Text>

      <Text style={labelStyle}>Ville *</Text>
      <TextInput style={inputStyle} value={city} onChangeText={setCity} placeholder="Ex: Paris" placeholderTextColor={theme.colors.mutedText} />

      <Text style={labelStyle}>Adresse *</Text>
      <TextInput style={inputStyle} value={address} onChangeText={setAddress} placeholder="Ex: Plage du Prophète" placeholderTextColor={theme.colors.mutedText} />

      <Text style={labelStyle}>Date (format ISO) *</Text>
      <TextInput style={inputStyle} value={date} onChangeText={setDate} placeholder="2025-06-15T09:00:00.000Z" placeholderTextColor={theme.colors.mutedText} />

      <Text style={[styles.sectionHeader, { color: theme.colors.text, borderBottomColor: theme.colors.border, marginTop: 16 }]}>
        Capacité & Organisation
      </Text>

      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={labelStyle}>Durée (heures)</Text>
          <TextInput style={inputStyle} value={durationHours} onChangeText={setDurationHours} keyboardType="numeric" placeholder="2" placeholderTextColor={theme.colors.mutedText} />
        </View>
        <View style={styles.half}>
          <Text style={labelStyle}>Places totales</Text>
          <TextInput style={inputStyle} value={slotsTotal} onChangeText={setSlotsTotal} keyboardType="numeric" placeholder="20" placeholderTextColor={theme.colors.mutedText} />
        </View>
      </View>

      <Text style={labelStyle}>Organisateur</Text>
      <TextInput style={inputStyle} value={organizerName} onChangeText={setOrganizerName} placeholder="Nom de l'organisateur" placeholderTextColor={theme.colors.mutedText} />

      <Text style={labelStyle}>URL de l'image</Text>
      <TextInput style={inputStyle} value={imageUrl} onChangeText={setImageUrl} placeholder="https://..." placeholderTextColor={theme.colors.mutedText} />

      <Pressable
        onPress={handleSubmit}
        style={({ pressed }) => [styles.submitBtn, { backgroundColor: theme.colors.primary, opacity: pressed ? 0.85 : 1 }]}
      >
        <Text style={styles.submitText}>{submitLabel}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  sectionHeader: {
    fontSize: 16, fontWeight: '700', paddingBottom: 10,
    borderBottomWidth: 1, marginBottom: 14,
  },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 4 },
  input: {
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, marginBottom: 4,
  },
  textarea: { minHeight: 90, textAlignVertical: 'top' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  typeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  typeChipText: { fontSize: 13, fontWeight: '500' },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  submitBtn: { padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 20 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});