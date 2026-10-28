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
        accessibilityLabel="Gaya Stiker: imut, ceria, serba pink"
        style={[styles.card, styles.stiker, { height: h }, value === 'stiker' && styles.on]}
      >
        {value === 'stiker' ? <Check /> : <Text {...display} style={styles.sticker}>IMUT ♡</Text>}
        <Text style={styles.heartBig}>♥</Text>
        <Text style={styles.heartSmall}>♥</Text>
        <Text {...display} style={styles.stikerName}>Stiker</Text>
        <Text {...display} style={styles.stikerNote}>Imut, ceria, serba pink ✦</Text>
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
  heartBig: { position: 'absolute', right: 26, bottom: 18, fontSize: 54, color: '#FFFFFF', opacity: 0.85, transform: [{ rotate: '12deg' }] },
  heartSmall: { position: 'absolute', right: 86, bottom: 58, fontSize: 24, color: '#FF4FA3', transform: [{ rotate: '-14deg' }] },
  butikNote: { fontSize: 11, letterSpacing: 2.4, color: deco.gold, marginTop: 6, fontWeight: '700' },
  stiker: {
    ...web({ backgroundImage: 'linear-gradient(135deg, #FFC4DF 0%, #FF9ACB 45%, #E9CCFF 100%)', boxShadow: '4px 5px 0 #FFB0D3' }),
    borderWidth: 2,
    borderColor: '#F0569A',
  },
  stikerName: { fontFamily: "'Fredoka', sans-serif", fontWeight: '700', fontSize: 38, lineHeight: 40, color: deco.berry },
  stikerNote: { fontFamily: "'Fredoka', sans-serif", fontWeight: '600', fontSize: 14, marginTop: 4, color: deco.berry },
  sticker: {
    position: 'absolute',
    top: 16,
    right: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F0569A',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontFamily: "'Fredoka', sans-serif",
    fontWeight: '700',
    fontSize: 12,
    color: deco.pink,
    transform: [{ rotate: '6deg' }],
    ...web({ boxShadow: '2px 3px 0 #FFB0D3' }),
  },
  check: { position: 'absolute', top: 14, right: 14, width: 26, height: 26, borderRadius: 13, backgroundColor: '#D6336C', alignItems: 'center', justifyContent: 'center', zIndex: 1 },
});
