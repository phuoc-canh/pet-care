import Ionicons from '@expo/vector-icons/Ionicons';
import { memo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, PressableScale } from '@/components/ui';
import type { ServiceOption } from '@/constants/appointment';
import { strings } from '@/constants/strings';
import { haptic } from '@/hooks/useHaptic';
import { colors, radius, shadow, spacing } from '@/theme/theme';
import type { ServiceId } from '@/types/services-type/appointment.type';
import { formatVnd } from '@/utils/format';

export interface ServiceCardProps {
  service: ServiceOption;
  selected: boolean;
  onSelect: (id: ServiceId) => void;
}

function ServiceCardBase({ service, selected, onSelect }: ServiceCardProps) {
  const handlePress = useCallback(() => {
    if (!selected) haptic.selection();
    onSelect(service.id);
  }, [onSelect, selected, service.id]);

  return (
    <PressableScale
      onPress={handlePress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${service.name}, ${formatVnd(service.price)}, ${strings.appointment.duration(service.durationMin)}`}
      style={[styles.card, selected && styles.selected]}
    >
      <View style={[styles.icon, selected && styles.iconSelected]}>
        <Ionicons name={service.icon} size={22} color={selected ? colors.white : colors.primary} />
      </View>
      <View style={styles.text}>
        <AppText variant="bodyStrong" numberOfLines={1}>
          {service.name}
        </AppText>
        <AppText variant="caption" tone="secondary" numberOfLines={2}>
          {service.description}
        </AppText>
      </View>
      <View style={styles.price}>
        <AppText variant="bodyStrong" tone="primary">
          {formatVnd(service.price)}
        </AppText>
        <AppText variant="caption" tone="secondary">
          {strings.appointment.duration(service.durationMin)}
        </AppText>
      </View>
    </PressableScale>
  );
}

export const ServiceCard = memo(ServiceCardBase);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.button + 4,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.surface,
    ...shadow.soft,
  },
  selected: { borderColor: colors.primary },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radius.input,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSelected: { backgroundColor: colors.primary },
  text: { flex: 1, gap: 2 },
  price: { alignItems: 'flex-end', gap: 2 },
});
