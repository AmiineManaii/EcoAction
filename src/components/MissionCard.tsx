import { useRouter } from 'expo-router';
import { Image, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Mission } from '../api/missions';
import { useTheme } from '../theme/theme';
import { useAuth } from '../hooks/useAuth';

type MissionCardProps = { mission: Mission };

const TYPE_LABELS: Record<string, string> = {
  nettoyage_plage: 'Nettoyage',
  plantation_arbres: 'Plantation',
  atelier_zero_dechet: 'Zéro déchet',
  sensibilisation: 'Sensibilisation',
  jardinage_urbain: 'Jardinage',
  collecte_dechets: 'Collecte',
};


const TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  nettoyage_plage: 'water-outline',
  plantation_arbres: 'leaf-outline',
  atelier_zero_dechet: 'refresh-outline',
  sensibilisation: 'megaphone-outline',
  jardinage_urbain: 'flower-outline',
  collecte_dechets: 'trash-outline',
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  open: { label: 'Ouverte', color: '#40916C' },
  full: { label: 'Complète', color: '#D4A017' },
  completed: { label: 'Terminée', color: '#6B7280' },
  cancelled: { label: 'Annulée', color: '#C0392B' },
};

export function MissionCard({ mission }: MissionCardProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();

  const statusConf = STATUS_CONFIG[mission.status] ?? { label: mission.status, color: '#6B7280' };
  const slots = mission.slotsTotal - mission.slotsTaken;
  const fillPercent = Math.min((mission.slotsTaken / mission.slotsTotal) * 100, 100);
  const isRegistered = user ? mission.participants.includes(user.id) : false;
  const typeIcon = TYPE_ICONS[mission.type] ?? 'help-outline';

  return (
    <Pressable
      className="rounded-2xl overflow-hidden mb-4"
      style={{
        backgroundColor: theme.colors.card,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
      }}
      onPress={() =>
        router.push({ pathname: '/(tabs)/mission-detail', params: { id: String(mission.id) } })
      }
    >
     
      <View className="relative">
        <Image source={{ uri: mission.imageUrl }} className="w-full h-44" />

       
        <View
          className="absolute top-2.5 right-2.5 px-3 py-1 rounded-full"
          style={{ backgroundColor: statusConf.color }}
        >
          <Text className="text-white text-xs font-bold">{statusConf.label}</Text>
        </View>

       
        {isRegistered && (
          <View
            className="absolute top-2.5 left-2.5 flex-row items-center gap-1 px-3 py-1 rounded-full"
            style={{ backgroundColor: theme.colors.primary }}
          >
            <Ionicons name="checkmark-circle" size={12} color="#fff" />
            <Text className="text-white text-xs font-bold">Inscrit</Text>
          </View>
        )}
      </View>

    
      <View className="p-3.5" style={{ backgroundColor: theme.colors.card }}>
       
        <View className="flex-row justify-between items-center mb-2">
          <View
            className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ backgroundColor: theme.colors.accent }}
          >
            <Ionicons name={typeIcon} size={13} color={theme.colors.primary} />
            <Text className="text-xs font-semibold" style={{ color: theme.colors.primary }}>
              {TYPE_LABELS[mission.type] ?? mission.type}
            </Text>
          </View>

          <View className="flex-row items-center gap-1">
            <Ionicons name="calendar-outline" size={13} color={theme.colors.mutedText} />
            <Text className="text-xs" style={{ color: theme.colors.mutedText }}>
              {new Date(mission.date).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
              })}
            </Text>
          </View>
        </View>

    
        <Text
          className="text-base font-bold mb-1.5 leading-5"
          style={{ color: theme.colors.text }}
          numberOfLines={2}
        >
          {mission.title}
        </Text>

        
        <View className="flex-row gap-4 mb-2.5">
          <View className="flex-row items-center gap-1">
            <Ionicons name="location-outline" size={13} color={theme.colors.mutedText} />
            <Text className="text-sm" style={{ color: theme.colors.mutedText }}>
              {mission.city}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="time-outline" size={13} color={theme.colors.mutedText} />
            <Text className="text-sm" style={{ color: theme.colors.mutedText }}>
              {mission.durationHours}h
            </Text>
          </View>
        </View>

        
        <View className="flex-row items-center gap-2.5">
          <View
            className="flex-1 h-1.5 rounded-full overflow-hidden"
            style={{ backgroundColor: theme.colors.border }}
          >
            <View
              style={{
                width: `${fillPercent}%`,
                height: '100%',
                borderRadius: 999,
                backgroundColor: fillPercent >= 90 ? '#E74C3C' : theme.colors.primary,
              }}
            />
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="people-outline" size={13} color={theme.colors.mutedText} />
            <Text className="text-xs min-w-[100px] text-right" style={{ color: theme.colors.mutedText }}>
              {slots > 0
                ? `${slots} place${slots > 1 ? 's' : ''} restante${slots > 1 ? 's' : ''}`
                : 'Complet'}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}