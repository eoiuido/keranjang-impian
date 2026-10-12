import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Page, PrimaryButton, SecondaryButton } from '@/components/ui';
import { rupiah } from '@/lib/format';
import { declineOfferSeen, markDeclineOfferSeen, perWeek, PLANS, type PlanId } from '@/lib/plan';
import { track } from '@/lib/track';
import { colors, radius } from '@/theme';

const BENEFITS = [
  'Checkout palsu tanpa batas',
  'Target tabungan (misal: laptop impian)',
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
        <View style={styles.offerTop}>
          <Text style={styles.offerWait}>Tunggu!</Text>
          <Text style={styles.offerTitle}>
            Tahunan cuma <Text style={styles.offerPrice}>{rupiah(y.offerPrice)}</Text>
          </Text>
          <Text style={styles.offerStrike}>{rupiah(y.price)}</Text>
          <Text style={styles.offerSub}>
            Hemat {rupiah(y.price - y.offerPrice)}, cuma {rupiah(perWeek(y.offerPrice))}/minggu. Penawaran ini cuma muncul
            sekali.
          </Text>
        </View>
        <Benefits />
        <View style={styles.bottom}>
          <PrimaryButton label={`Ambil ${rupiah(y.offerPrice)} / 1 tahun`} onPress={() => pay('yearly', true)} />
          <SecondaryButton
            label={`Mingguan ${rupiah(PLANS.weekly.price)} / 7 hari`}
            onPress={() => pay('weekly', false)}
          />
          <Pressable onPress={later} accessibilityRole="button" style={styles.later}>
            <Text style={styles.laterText}>Nanti saja</Text>
          </Pressable>
          <Footer />
        </View>
      </Page>
    );
  }

  const price = PLANS[plan].price;
  return (
    <Page>
      <Text style={styles.title}>Lanjut checkout palsu tanpa batas</Text>
      <Text style={styles.sub}>3 checkout gratismu sudah terpakai. Keren, uangmu tetap aman!</Text>
      <Benefits />

      <View style={styles.plans}>
        <PlanCard
          on={plan === 'yearly'}
          onPress={() => setPlan('yearly')}
          name={PLANS.yearly.name}
          price={`${rupiah(PLANS.yearly.price)} / ${PLANS.yearly.period}`}
          note="Bayar sekali untuk setahun."
          badge={`Paling hemat: cuma ${rupiah(perWeek(PLANS.yearly.price))}/minggu`}
        />
        <PlanCard
          on={plan === 'weekly'}
          onPress={() => setPlan('weekly')}
          name={PLANS.weekly.name}
          price={`${rupiah(PLANS.weekly.price)} / ${PLANS.weekly.period}`}
          note="Gak otomatis diperpanjang. Bayar lagi kalau mau lanjut."
        />
      </View>

      <View style={styles.bottom}>
        <PrimaryButton label={`Lanjut bayar ${rupiah(price)}`} onPress={() => pay(plan, false)} />
        <Pressable onPress={later} accessibilityRole="button" style={styles.later}>
          <Text style={styles.laterText}>Nanti saja</Text>
        </Pressable>
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
          <Text style={styles.check}>✓</Text>
          <Text style={styles.benefitText}>{b}</Text>
        </View>
      ))}
    </View>
  );
}

function PlanCard(p: { on: boolean; onPress: () => void; name: string; price: string; note: string; badge?: string }) {
  return (
    <Pressable
      onPress={p.onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: p.on }}
      style={[styles.plan, p.on && styles.planOn]}
    >
      {p.badge && <Text style={styles.badge}>{p.badge}</Text>}
      <View style={styles.planRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.planName}>{p.name}</Text>
          <Text style={styles.planPrice}>{p.price}</Text>
          <Text style={styles.planNote}>{p.note}</Text>
        </View>
        <View style={[styles.radio, p.on && styles.radioOn]} />
      </View>
    </Pressable>
  );
}

function Footer() {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>Bayar pakai QRIS. Tidak ada tagihan otomatis.</Text>
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
  title: { fontSize: 28, lineHeight: 34, fontWeight: '800', color: colors.text },
  sub: { marginTop: 6, fontSize: 16, lineHeight: 22, color: colors.textSoft },
  benefits: { marginTop: 18, gap: 8 },
  benefit: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  check: { fontSize: 16, fontWeight: '900', color: colors.pinkDeep, width: 18 },
  benefitText: { flex: 1, fontSize: 15, lineHeight: 21, color: colors.text },
  plans: { marginTop: 20, gap: 12 },
  plan: { backgroundColor: colors.card, borderRadius: radius.md, padding: 16, borderWidth: 2, borderColor: colors.pink },
  planOn: { borderColor: colors.pinkDeep, backgroundColor: '#FFF0F6' },
  badge: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
    backgroundColor: colors.mint,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  planName: { fontSize: 15, fontWeight: '700', color: colors.textSoft },
  planPrice: { marginTop: 2, fontSize: 20, fontWeight: '800', color: colors.text },
  planNote: { marginTop: 2, fontSize: 13, color: colors.textSoft },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.pink },
  radioOn: { borderWidth: 7, borderColor: colors.pinkDeep },
  bottom: { marginTop: 'auto', paddingTop: 24, gap: 10 },
  later: { alignSelf: 'center', padding: 10 },
  laterText: { fontSize: 15, color: colors.textSoft, textDecorationLine: 'underline' },
  footer: { gap: 4, alignItems: 'center' },
  footerText: { fontSize: 12, color: colors.textSoft, textAlign: 'center' },
  footerLink: { textDecorationLine: 'underline', color: colors.text },
  offerTop: { alignItems: 'center', paddingTop: 12 },
  offerWait: { fontSize: 20, fontWeight: '800', color: colors.pinkDeep },
  offerTitle: { marginTop: 6, fontSize: 26, fontWeight: '800', color: colors.text, textAlign: 'center' },
  offerPrice: { color: colors.pinkDeep },
  offerStrike: { marginTop: 4, fontSize: 18, color: colors.textSoft, textDecorationLine: 'line-through' },
  offerSub: { marginTop: 8, fontSize: 15, lineHeight: 21, color: colors.text, textAlign: 'center' },
});
