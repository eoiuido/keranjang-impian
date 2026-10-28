import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { Header, Label, Page, PrimaryButton, SecondaryButton, TextButton } from '@/components/ui';
import { rupiah } from '@/lib/format';
import { declineOfferSeen, markDeclineOfferSeen, perWeek, PLANS, type PlanId } from '@/lib/plan';
import { track } from '@/lib/track';
import { colors, radius, type } from '@/theme';

const BENEFITS = [
  'Checkout palsu tanpa batas',
  'Target tabungan, misal laptop impian',
  'Total uang yang kamu selamatkan',
  'Rekap bulanan yang bisa kamu share',
  'Backup online, aman kalau ganti HP',
  'Pengingat sebelum 9.9, 10.10, 11.11, 12.12 & gajian',
];

const HELP_EMAIL = 'eoi.uido@gmail.com';

// S10 paywall, and S10b the one-time decline offer.
export default function Paywall() {
  const [plan, setPlan] = useState<PlanId>('yearly');
  const [offer, setOffer] = useState(false);

  useEffect(() => {
    track('paywall_view');
  }, []);

  const pay = (p: PlanId, withOffer: boolean) => {
    router.push({ pathname: '/bayar', params: withOffer && p === 'yearly' ? { plan: p, offer: '1' } : { plan: p } });
  };

  const later = async () => {
    if (!offer) {
      track('paywall_declined');
      if (!(await declineOfferSeen())) {
        await markDeclineOfferSeen();
        track('decline_offer_viewed');
        setOffer(true);
        return;
      }
    }
    router.replace('/koleksi');
  };

  if (offer) {
    const y = PLANS.yearly;
    return (
      <Page>
        <Header />
        <View style={styles.offerBadge}>
          <Text style={styles.offerBadgeText}>Penawaran sekali saja</Text>
        </View>
        <Text style={styles.title}>Tahunan cuma {rupiah(y.offerPrice)}</Text>
        <View style={styles.offerPriceRow}>
          <Text style={styles.strike}>{rupiah(y.price)}</Text>
          <Text style={styles.save}>Hemat {rupiah(y.price - y.offerPrice)}</Text>
        </View>
        <Text style={styles.sub}>Cuma {rupiah(perWeek(y.offerPrice))} per minggu. Penawaran ini tidak muncul lagi.</Text>
        <Benefits />
        <View style={styles.bottom}>
          <PrimaryButton label={`Ambil ${rupiah(y.offerPrice)} / tahun`} onPress={() => pay('yearly', true)} />
          <SecondaryButton label={`Mingguan ${rupiah(PLANS.weekly.price)} / 7 hari`} onPress={() => pay('weekly', false)} />
          <TextButton label="Nanti saja" onPress={later} />
          <Footer />
        </View>
      </Page>
    );
  }

  const price = PLANS[plan].price;
  return (
    <Page>
      <Header onBack={() => router.back()} />
      <Text style={styles.title}>Lanjut checkout palsu tanpa batas</Text>
      <Text style={styles.sub}>3 checkout gratismu sudah terpakai. Uangmu tetap aman.</Text>
      <Benefits />

      <View style={styles.plans}>
        <PlanCard
          on={plan === 'yearly'}
          onPress={() => setPlan('yearly')}
          name={PLANS.yearly.name}
          price={rupiah(PLANS.yearly.price)}
          period="/ tahun"
          note={`Cuma ${rupiah(perWeek(PLANS.yearly.price))} per minggu. Bayar sekali.`}
          badge="Paling hemat"
        />
        <PlanCard
          on={plan === 'weekly'}
          onPress={() => setPlan('weekly')}
          name={PLANS.weekly.name}
          price={rupiah(PLANS.weekly.price)}
          period="/ 7 hari"
          note="Gak otomatis diperpanjang. Bayar lagi kalau mau lanjut."
        />
      </View>

      <View style={styles.bottom}>
        <PrimaryButton label={`Lanjut bayar ${rupiah(price)}`} onPress={() => pay(plan, false)} />
        <TextButton label="Nanti saja" onPress={later} />
        <Footer />
      </View>
    </Page>
  );
}

function Benefits() {
  return (
    <View style={styles.benefits}>
      {BENEFITS.map((b) => (
        <View key={b} style={styles.benefit}>
          <Icon name="check" size={18} color={colors.accent} strokeWidth={2.2} />
          <Text style={styles.benefitText}>{b}</Text>
        </View>
      ))}
    </View>
  );
}

function PlanCard(p: { on: boolean; onPress: () => void; name: string; price: string; period: string; note: string; badge?: string }) {
  return (
    <Pressable
      onPress={p.onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: p.on }}
      style={[styles.plan, p.on && styles.planOn]}
    >
      <View style={styles.planTop}>
        <Label>{p.name}</Label>
        {p.badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{p.badge}</Text>
          </View>
        )}
        <View style={{ flex: 1 }} />
        <View style={[styles.radio, p.on && styles.radioOn]}>{p.on && <View style={styles.radioDot} />}</View>
      </View>
      <Text style={styles.planPrice}>
        {p.price} <Text style={styles.planPeriod}>{p.period}</Text>
      </Text>
      <Text style={styles.planNote}>{p.note}</Text>
    </Pressable>
  );
}

function Footer() {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>Bayar pakai QRIS atau e-wallet. Tidak ada tagihan otomatis.</Text>
      <Text style={styles.footerText}>
        Bantuan:{' '}
        <Text style={styles.footerLink} onPress={() => Linking.openURL(`mailto:${HELP_EMAIL}`)}>
          {HELP_EMAIL}
        </Text>
        {' · '}
        <Text style={styles.footerLink} onPress={() => router.push('/refund')}>
          Kebijakan refund
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { ...type.title, color: colors.text },
  sub: { ...type.body, marginTop: 8, color: colors.textSoft },
  benefits: { marginTop: 22, gap: 10 },
  benefit: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  benefitText: { ...type.body, flex: 1, color: colors.text },
  plans: { marginTop: 24, gap: 10 },
  plan: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 16 },
  planOn: { borderColor: colors.accent, borderWidth: 2, padding: 15 },
  planTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { backgroundColor: colors.accentSoft, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '700', color: colors.accent },
  planPrice: { ...type.money, fontSize: 26, lineHeight: 32, marginTop: 8, color: colors.text },
  planPeriod: { fontSize: 14, fontWeight: '600', color: colors.textSoft },
  planNote: { ...type.small, marginTop: 4, color: colors.textSoft },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.accent },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.accent },
  bottom: { marginTop: 'auto', paddingTop: 28, gap: 8 },
  footer: { gap: 4, alignItems: 'center', marginTop: 4 },
  footerText: { ...type.small, fontSize: 12, color: colors.textSoft, textAlign: 'center' },
  footerLink: { color: colors.text, textDecorationLine: 'underline' },
  offerBadge: { alignSelf: 'flex-start', backgroundColor: colors.accentSoft, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 12 },
  offerBadgeText: { fontSize: 12, fontWeight: '700', color: colors.accent },
  offerPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  strike: { ...type.body, color: colors.textFaint, textDecorationLine: 'line-through' },
  save: { fontSize: 14, fontWeight: '700', color: colors.accent },
});
