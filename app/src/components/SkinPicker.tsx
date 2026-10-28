import { Pressable, StyleSheet, Text, View } from 'react-native';
import { setSkin } from '@/lib/skin';
import { deco, type SkinName } from '@/theme';
import { Icon } from './Icon';

// Gradients are web-only styles that React Native's types don't know.
const web = (s: Record<string, string>) => s as object;
// Each card is its own little skin scope, so its name uses that skin's display font.
const scope = (skin: SkinName) => ({ dataSet: { skin } }) as object;
const display = { dataSet: { display: '' } } as object;

// Two big preview cards, each drawn in its own skin's look (so they ignore the current skin).
// Tapping one switches the whole app instantly.
export function SkinPicker({ value, onChange, compact }: { value: SkinName | null; onChange: (s: SkinName) => void; compact?: boolean }) {
  const pick = (s: SkinName) => {
    setSkin(s);
    onChange(s);
  };
  const h = compact ? 128 : 180;
  return (
    <View style={{ gap: 14 }}>
      <Pressable
        {...scope('butik')}
        onPress={() => pick('butik')}
        accessibilityRole="radio"
        accessibilityState={{ checked: value === 'butik' }}
        accessibilityLabel="Gaya Butik: mewah, tenang, berkelas"
        style={[styles.card, styles.butik, { height: h }, value === 'butik' && styles.on]}
      >
        <View style={[StyleSheet.absoluteFill, web({ backgroundImage: 'linear-gradient(115deg, transparent 30%, rgba(255,220,240,.16) 45%, transparent 60%)' })]} />
        {value === 'butik' && <Check />}
        <Text {...display} style={styles.butikName}>Butik</Text>
        <Text style={styles.butikNote}>MEWAH · TENANG · BERKELAS</Text>
      </Pressable>

      <Pressable
        {...scope('stiker')}
        onPress={() => pick('stiker')}
        accessibilityRole="radio"
        accessibilityState={{ checked: value === 'stiker' }}
        accessibilityLabel="Gaya Stiker: ceria, rame, warna-warni"
        style={[styles.card, styles.stiker, { height: h }, value === 'stiker' && styles.on]}
      >
        {value === 'stiker' ? <Check /> : <Text {...display} style={styles.sticker}>SERU!</Text>}
        <Text {...display} style={styles.stikerName}>Stiker</Text>
        <Text {...display} style={styles.stikerNote}>Ceria, rame, warna-warni ✦</Text>
      </Pressable>
    </View>
  );
}

function Check() {
  return (
    <View style={styles.check}>
      <Icon name="check" size={14} color="#FFFFFF" strokeWidth={3} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 22, padding: 16, justifyContent: 'flex-end', overflow: 'hidden' },
  on: { outlineWidth: 3, outlineStyle: 'solid', outlineColor: '#D6336C', outlineOffset: 3 },
  butik: web({ backgroundImage: 'radial-gradient(120% 90% at 20% 0%, #6B2B4F 0%, #2A0F22 60%, #12060F 100%)' }),
  butikName: { fontFamily: "'Bodoni Moda', serif", fontStyle: 'italic', fontSize: 32, lineHeight: 34, color: '#F7F1EA' },
  butikNote: { fontSize: 11, letterSpacing: 2.4, color: deco.gold, marginTop: 6, fontWeight: '700' },
  stiker: {
    ...web({ backgroundImage: 'linear-gradient(120deg, #FFB3E1, #C9B6FF 30%, #A8F0FF 60%, #FFF1A8)' }),
    borderWidth: 2.5,
    borderColor: deco.ink,
  },
  stikerName: { fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: '800', fontSize: 36, lineHeight: 36, letterSpacing: -1, color: deco.ink },
  stikerNote: { fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: '700', fontSize: 13, marginTop: 6, color: deco.ink },
  sticker: {
    position: 'absolute',
    top: 16,
    right: 14,
    backgroundColor: deco.lime,
    borderWidth: 2.5,
    borderColor: deco.ink,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontFamily: "'Bricolage Grotesque', sans-serif",
    fontWeight: '800',
    fontSize: 12,
    color: deco.ink,
    transform: [{ rotate: '6deg' }],
    ...web({ boxShadow: '3px 3px 0 #111' }),
  },
  check: { position: 'absolute', top: 14, right: 14, width: 26, height: 26, borderRadius: 13, backgroundColor: '#D6336C', alignItems: 'center', justifyContent: 'center', zIndex: 1 },
});
