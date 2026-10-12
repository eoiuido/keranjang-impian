import { Image, StyleSheet, View } from 'react-native';
import type { CartItem } from '@/lib/cart';
import { colors, radius } from '@/theme';
import { Tumbler } from './Tumbler';

// The item's photo, the sample tumbler, or a pastel shopping-bag placeholder.
export function ItemPicture({ item, size }: { item: CartItem; size: number }) {
  const box = { width: size, height: size, borderRadius: radius.md };
  if (item.photo) {
    return <Image source={{ uri: item.photo }} style={[box, styles.photo]} accessibilityLabel={item.name} />;
  }
  if (item.sample) {
    return (
      <View style={[box, styles.frame, { backgroundColor: colors.butter }]}>
        <Tumbler size={size / 230} />
      </View>
    );
  }
  return (
    <View style={[box, styles.frame, { backgroundColor: colors.lavender }]} accessibilityLabel="Gambar barang">
      <View style={[styles.handle, { width: size * 0.22, height: size * 0.16, borderWidth: size * 0.03 }]} />
      <View style={[styles.bag, { width: size * 0.42, height: size * 0.36, borderRadius: size * 0.05 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  photo: { backgroundColor: colors.card },
  frame: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  bag: { backgroundColor: colors.pink },
  handle: { borderColor: colors.pinkDeep, borderBottomWidth: 0, borderTopLeftRadius: 99, borderTopRightRadius: 99 },
});
