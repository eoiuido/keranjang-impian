import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ItemPicture } from '@/components/ItemPicture';
import { Page, PrimaryButton } from '@/components/ui';
import { cart, type CartItem, MAX_PRICE, MIN_PRICE, SAMPLE_ITEM } from '@/lib/cart';
import { rupiah } from '@/lib/format';
import { pickPhoto } from '@/lib/photo';
import { loadWallet } from '@/lib/profile';
import { track } from '@/lib/track';
import { colors, radius } from '@/theme';

const idr = new Intl.NumberFormat('id-ID');

// S4. Your dream item: the sample tumbler, or the user's own photo + price.
export default function Barang() {
  const [balance, setBalance] = useState<number | null | undefined>(undefined);
  const [own, setOwn] = useState(false);
  const [photo, setPhoto] = useState<string | undefined>();
  const [photoError, setPhotoError] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);

  useEffect(() => {
    loadWallet().then((w) => setBalance(w ? w.balance : null));
  }, []);

  if (balance === null) return <Redirect href="/mulai" />; // onboarding not done yet

  const item: CartItem = own
    ? { name: name.trim() || 'Barang impian', price, photo, sample: false }
    : SAMPLE_ITEM;
  const priceOk = item.price >= MIN_PRICE && item.price <= MAX_PRICE;

  const addPhoto = async () => {
    setPhotoError(false);
    try {
      const p = await pickPhoto();
      if (p) {
        setPhoto(p);
        track('item_photo_added');
      }
    } catch {
      setPhoto(undefined);
      setPhotoError(true);
    }
  };

  const checkout = () => {
    cart.item = item;
    router.push('/checkout');
  };

  return (
    <Page>
      <Text style={styles.title}>Barang impianmu</Text>
      <Text style={styles.sub}>
        {own ? 'Foto atau screenshot barangnya, lalu isi harganya.' : 'Pakai contoh ini, atau ganti dengan barang yang lagi kamu pengen.'}
      </Text>

      <View style={styles.card}>
        {own ? (
          <Pressable onPress={addPhoto} accessibilityRole="button" accessibilityLabel="Tambah foto atau screenshot">
            <ItemPicture item={item} size={200} />
            <Text style={styles.photoLink}>{photo ? 'Ganti foto' : '+ Tambah foto / screenshot'}</Text>
          </Pressable>
        ) : (
          <ItemPicture item={item} size={200} />
        )}
        {photoError && <Text style={styles.error}>Foto gagal dimuat, pakai gambar default ya.</Text>}

        {own ? (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Nama barang (boleh kosong)"
              placeholderTextColor={colors.textSoft}
              value={name}
              onChangeText={setName}
              maxLength={60}
            />
            <View style={styles.priceRow}>
              <Text style={styles.rp}>Rp</Text>
              <TextInput
                style={[styles.input, styles.priceInput]}
                placeholder="Harga"
                placeholderTextColor={colors.textSoft}
                keyboardType="number-pad"
                inputMode="numeric"
                value={price ? idr.format(price) : ''}
                onChangeText={(t) => setPrice(Math.min(MAX_PRICE, Number(t.replace(/\D/g, '')) || 0))}
                accessibilityLabel="Harga barang"
              />
            </View>
            {!priceOk && price > 0 && <Text style={styles.error}>Harga minimal {rupiah(MIN_PRICE)}.</Text>}
          </View>
        ) : (
          <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>{rupiah(item.price)}</Text>
          </View>
        )}
      </View>

      <Pressable onPress={() => setOwn(!own)} accessibilityRole="button" style={styles.switch}>
        <Text style={styles.switchText}>{own ? 'Pakai contoh tumbler aja' : 'Ganti dengan barangmu'}</Text>
      </Pressable>

      <View style={styles.bottom}>
        {typeof balance === 'number' && <Text style={styles.balance}>Saldo kamu: {rupiah(balance)}</Text>}
        <PrimaryButton label={priceOk ? 'Checkout' : 'Isi harga dulu'} onPress={checkout} disabled={!priceOk} />
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  sub: { marginTop: 6, fontSize: 16, lineHeight: 22, color: colors.textSoft },
  card: {
    marginTop: 20,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  photoLink: { marginTop: 8, fontSize: 15, fontWeight: '600', color: colors.pinkDeep, textAlign: 'center' },
  info: { alignItems: 'center', gap: 2 },
  name: { fontSize: 18, fontWeight: '600', color: colors.text },
  price: { fontSize: 24, fontWeight: '800', color: colors.text },
  form: { alignSelf: 'stretch', gap: 10 },
  input: {
    borderWidth: 2,
    borderColor: colors.pink,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 17,
    color: colors.text,
    backgroundColor: colors.bg,
  },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rp: { fontSize: 20, fontWeight: '800', color: colors.text },
  priceInput: { flex: 1, fontSize: 20, fontWeight: '700' },
  error: { fontSize: 14, color: colors.pinkDeep, textAlign: 'center' },
  switch: { marginTop: 14, alignSelf: 'center', padding: 8 },
  switchText: { fontSize: 16, fontWeight: '600', color: colors.text, textDecorationLine: 'underline' },
  bottom: { marginTop: 'auto', paddingTop: 24, gap: 10 },
  balance: { fontSize: 15, color: colors.textSoft, textAlign: 'center' },
});
