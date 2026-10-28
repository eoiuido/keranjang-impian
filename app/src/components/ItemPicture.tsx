import { Image, StyleSheet, View } from 'react-native';
import type { CartItem } from '@/lib/cart';
import { categoryIcon } from '@/lib/categories';
import { colors, radius, shape } from '@/theme';
import { Icon } from './Icon';

// The item's photo, or its category's outline icon on a light grey square.
export function ItemPicture({ item, size }: { item: CartItem; size: number }) {
  const box = { width: size, height: size, borderRadius: size > 120 ? radius.lg : radius.md };
  if (item.photo) {
    return <Image source={{ uri: item.photo }} style={[box, styles.photo]} accessibilityLabel={item.name} />;
  }
  const category = item.category ?? (item.sample ? 'tumbler' : 'other');
  return (
    <View style={[box, styles.frame]} accessibilityLabel={item.name}>
      <Icon name={categoryIcon(category)} size={Math.round(size * 0.42)} color={shape.pictureIcon} strokeWidth={size > 120 ? 1.3 : 1.6} />
    </View>
  );
}

const styles = StyleSheet.create({
  photo: { backgroundColor: colors.surface },
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: shape.border,
    borderColor: colors.line,
    ...({ backgroundImage: shape.pictureBg } as object),
  },
});
