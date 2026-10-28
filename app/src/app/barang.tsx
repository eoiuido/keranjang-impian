import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { ItemPicture } from '@/components/ItemPicture';
import { field, Header, Label, Page, PrimaryButton, Display } from '@/components/ui';
import { cart, type CartItem, MAX_PRICE, MIN_PRICE, SAMPLE_ITEM } from '@/lib/cart';
import { CATEGORIES, type CategoryId } from '@/lib/categories';
import { rupiah } from '@/lib/format';
import { pickPhoto } from '@/lib/photo';
import { needsPaywall } from '@/lib/plan';
import { loadWallet } from '@/lib/profile';
import { track } from '@/lib/track';
import { colors, radius, type } from '@/theme';

const idr = new Intl.NumberFormat('id-ID');

// S4. Your dream item: the sample tumbler, or the user's own item (photo or category icon) + price.
export default function Barang() {
  const [balance, setBalance] = useState<number | null | undefined>(undefined);
  const [own, setOwn] = useState(false);
  const [photo, setPhoto] = useState<string | undefined>();
  const [photoError, setPhotoError] = useState(false);
  const [category, setCategory] = useState<CategoryId>('other');
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);

  useEffect(() => {
    loadWallet().then((w) => setBalance(w ? w.balance : null));
  }, []);

  if (balance === null) return <Redirect href="/mulai" />; // onboarding not done yet

  const item: CartItem = own
    ? { name: name.trim() || 'Barang impian', price, photo, category, sample: false }
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

  const checkout = async () => {
    cart.item = item;
    // Checkout number 4 for a free user opens the paywall instead.
    router.push((await needsPaywall()) ? '/paywall' : '/checkout');
  };

  return (
    <Page>
      <Header title="Barang impian" onBack={() => (router.canGoBack() ? router.back() : router.replace('/koleksi'))} />

      <View style={styles.tabs} accessibilityRole="tablist">
        {[
          ['Contoh', false],
          ['Barangku', true],
        ].map(([label, value]) => (
          <Pressable
            key={String(label)}
            onPress={() => setOwn(value as boolean)}
            accessibilityRole="tab"
            accessibilityState={{ selected: own === value }}
            style={[styles.tab, own === value && styles.tabOn]}
          >
            <Text style={[styles.tabText, own === value && styles.tabTextOn]}>{label as string}</Text>
          </Pressable>
        ))}
      </View>

      {own ? (
        <>
          <Pressable onPress={addPhoto} accessibilityRole="button" accessibilityLabel="Tambah foto atau screenshot" style={styles.pictureWrap}>
            <ItemPicture item={item} size={180} />
            <View style={styles.photoBtn}>
              <Icon name="image" size={16} strokeWidth={2} />
              <Text style={styles.photoBtnText}>{photo ? 'Ganti foto' : 'Tambah foto / screenshot'}</Text>
            </View>
          </Pressable>
          {photoError && <Text style={styles.error}>Foto gagal dimuat, kami pakai ikon kategori ya.</Text>}

          {!photo && (
            <>
              <Label style={styles.fieldLabel}>Kategori</Label>
              <View style={styles.chips}>
                {CATEGORIES.map((c) => {
                  const on = c.id === category;
                  return (
                    <Pressable
                      key={c.id}
                      onPress={() => setCategory(c.id)}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: on }}
                      style={[styles.chip, on && styles.chipOn]}
                    >
                      <Icon name={c.icon} size={16} color={on ? colors.white : colors.text} strokeWidth={1.8} />
                      <Text style={[styles.chipText, on && { color: colors.white }]}>{c.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          <Label style={styles.fieldLabel}>Nama barang</Label>
          <TextInput
            style={field}
            placeholder="Boleh kosong"
            placeholderTextColor={colors.textFaint}
            value={name}
            onChangeText={setName}
            maxLength={60}
            accessibilityLabel="Nama barang"
          />

          <Label style={styles.fieldLabel}>Harga</Label>
          <View style={styles.priceField}>
            <Text style={styles.rp}>Rp</Text>
            <TextInput
              style={styles.priceInput}
              placeholder="0"
              placeholderTextColor={colors.textFaint}
              keyboardType="number-pad"
              inputMode="numeric"
              value={price ? idr.format(price) : ''}
              onChangeText={(t) => setPrice(Math.min(MAX_PRICE, Number(t.replace(/\D/g, '')) || 0))}
              accessibilityLabel="Harga barang"
            />
          </View>
          {!priceOk && price > 0 && <Text style={styles.error}>Harga minimal {rupiah(MIN_PRICE)}.</Text>}
        </>
      ) : (
        <View style={styles.sample}>
          <ItemPicture item={item} size={240} />
          <Text style={styles.name}>{item.name}</Text>
          <Display kind="money" style={styles.price}>{rupiah(item.price)}</Display>
          <Text style={styles.hint}>Contoh barang. Pilih "Barangku" untuk barang yang lagi kamu pengen.</Text>
        </View>
      )}

      <View style={styles.bottom}>
        {typeof balance === 'number' && (
          <View style={styles.balance}>
            <Text style={styles.balanceLabel}>Saldo kamu</Text>
            <Text style={styles.balanceValue}>{rupiah(balance)}</Text>
          </View>
        )}
        <PrimaryButton label={priceOk ? 'Checkout' : 'Isi harga dulu'} onPress={checkout} disabled={!priceOk} />
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.md, padding: 4, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: radius.sm, alignItems: 'center' },
  tabOn: { backgroundColor: colors.white, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.textSoft },
  tabTextOn: { color: colors.text },
  sample: { alignItems: 'center' },
  name: { ...type.h2, marginTop: 18, color: colors.text, textAlign: 'center' },
  price: { ...type.money, fontSize: 28, marginTop: 2, color: colors.text },
  hint: { ...type.small, marginTop: 10, color: colors.textSoft, textAlign: 'center' },
  pictureWrap: { alignItems: 'center' },
  photoBtn: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  photoBtnText: { fontSize: 14, fontWeight: '600', color: colors.text },
  fieldLabel: { marginTop: 20, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipOn: { backgroundColor: colors.text, borderColor: colors.text },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.text },
  priceField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
  },
  rp: { fontSize: 20, fontWeight: '700', color: colors.textSoft, marginRight: 6 },
  priceInput: { flex: 1, paddingVertical: 12, fontSize: 22, fontWeight: '800', color: colors.text },
  error: { ...type.small, marginTop: 8, color: colors.warn },
  bottom: { marginTop: 'auto', paddingTop: 28, gap: 12 },
  balance: { flexDirection: 'row', justifyContent: 'space-between' },
  balanceLabel: { ...type.body, color: colors.textSoft },
  balanceValue: { ...type.body, fontWeight: '700', color: colors.text },
});
