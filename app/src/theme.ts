// Spirit Belongings: minimal light look (owner decision 2026-10-28).
export const colors = {
  bg: '#FFFFFF',
  surface: '#F5F5F7', // picture boxes, inputs, subtle cards
  line: '#E7E7EB',
  text: '#111114',
  textSoft: '#6B6B73',
  textFaint: '#A1A1AA',
  accent: '#D6336C', // pink: main buttons and "saved" amounts
  accentSoft: '#FCE8EF',
  warn: '#B54708',
  warnSoft: '#FFF4E5',
  ink: '#111114', // real-money screens use dark, never pink
  white: '#FFFFFF',
};

export const radius = { sm: 10, md: 14, lg: 20, pill: 999 };

export const maxWidth = 440; // keep a phone-sized column on big screens

// Plus Jakarta Sans is loaded once in +html.tsx and applied to all text on web.
export const type = {
  hero: { fontSize: 34, lineHeight: 38, fontWeight: '800' as const, letterSpacing: -0.6 },
  title: { fontSize: 26, lineHeight: 32, fontWeight: '800' as const, letterSpacing: -0.4 },
  h2: { fontSize: 18, lineHeight: 24, fontWeight: '700' as const },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' as const },
  small: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '600' as const, letterSpacing: 0.3 },
  money: { fontSize: 32, lineHeight: 38, fontWeight: '800' as const, letterSpacing: -0.6 },
};
