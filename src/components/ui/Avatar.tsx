import { memo } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { SPECIES_MAP } from '@/constants/pet';
import { colors, speciesPastel } from '@/theme/theme';
import type { Species } from '@/types/services-type/pet.type';

export interface AvatarProps {
  species: Species;
  size?: number;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Avatar tròn chứa emoji theo loài trên nền pastel; viền primary khi đang chọn. */
function AvatarBase({ species, size = 56, selected = false, style }: AvatarProps) {
  const ring = selected ? 3 : 0;
  return (
    <View
      style={[
        styles.ring,
        { width: size + 8, height: size + 8, borderRadius: (size + 8) / 2, borderWidth: ring },
        selected ? styles.ringOn : styles.ringOff,
        style,
      ]}
    >
      <View
        style={[
          styles.circle,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: speciesPastel[species] },
        ]}
      >
        <Text style={{ fontSize: size * 0.52, lineHeight: size * 0.68 }} allowFontScaling={false}>
          {SPECIES_MAP[species].emoji}
        </Text>
      </View>
    </View>
  );
}

export const Avatar = memo(AvatarBase);

const styles = StyleSheet.create({
  ring: { alignItems: 'center', justifyContent: 'center' },
  ringOn: { borderColor: colors.primary },
  ringOff: { borderColor: colors.transparent },
  circle: { alignItems: 'center', justifyContent: 'center' },
});
