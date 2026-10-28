// Spirit Belongings has two skins (owner decision 2026-10-29): Butik (burgundy luxury) and Stiker (girly pink).
// Styles point at CSS variables; the skin chosen on <html data-skin="..."> fills them in,
// so switching skins is instant and every screen shares one layout.
// "netral" is the plain minimal look, used before a skin is picked and on real-money screens.

export type SkinName = 'butik' | 'stiker';

type Tokens = {
  bg: string;
  bgImage: string; // pattern or glow behind every screen
  surface: string; // picture boxes, inputs, subtle cards
  card: string;
  line: string; // borders of cards, inputs, buttons
  divider: string; // thin lines between rows
  text: string;
  textSoft: string;
  textFaint: string;
  accent: string; // main buttons and "saved" amounts
  accentImage: string; // shine on main buttons
  onAccent: string; // text on main buttons
  accentSoft: string;
  warn: string;
  warnSoft: string;
  fontBody: string;
  fontDisplay: string;
  displayWeight: string; // headings and money amounts
  displaySpacing: string;
  titleStyle: string; // italic headings in Butik
  fontButton: string;
  buttonWeight: string;
  buttonSize: string;
  rSm: string;
  rMd: string; // buttons
  rLg: string; // cards
  border: string; // border width of cards, inputs, buttons
  shadow: string; // cards and buttons
  shadowSm: string; // tabs, chips, small cards
  pictureBg: string; // background behind item icons/photos
  pictureIcon: string;
  btnCase: string; // text-transform of button labels
  btnSpacing: string; // letter-spacing of button labels
  browserBar: string; // colour of the phone browser's top bar
};

const JAKARTA = "'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

const NETRAL: Tokens = {
  bg: '#FFFFFF',
  bgImage: 'none',
  surface: '#F5F5F7',
  card: '#FFFFFF',
  line: '#E7E7EB',
  divider: '#E7E7EB',
  text: '#111114',
  textSoft: '#6B6B73',
  textFaint: '#A1A1AA',
  accent: '#D6336C',
  accentImage: 'none',
  onAccent: '#FFFFFF',
  accentSoft: '#FCE8EF',
  warn: '#B54708',
  warnSoft: '#FFF4E5',
  fontBody: JAKARTA,
  fontDisplay: JAKARTA,
  displayWeight: '800',
  displaySpacing: '-0.02em',
  titleStyle: 'normal',
  fontButton: JAKARTA,
  buttonWeight: '700',
  buttonSize: '16px',
  rSm: '10px',
  rMd: '14px',
  rLg: '20px',
  border: '1px',
  shadow: 'none',
  shadowSm: '0 1px 4px rgba(0,0,0,.08)',
  pictureBg: 'none',
  pictureIcon: '#A1A1AA',
  btnCase: 'none',
  btnSpacing: '0px',
  browserBar: '#FFFFFF',
};

export const SKINS: Record<SkinName | 'netral', Tokens> = {
  netral: NETRAL,
  // Butik: a luxury boutique at night. Deep burgundy, cream text, gold buttons and prices.
  butik: {
    bg: '#2A0C21',
    bgImage: 'radial-gradient(140% 70% at 50% 0%, #5C1D42 0%, #34102A 45%, #1E0718 100%)',
    surface: '#40162F',
    card: '#3A1229',
    line: '#6E4157',
    divider: '#52223F',
    text: '#F7EDE4',
    textSoft: '#D2B6C3',
    textFaint: '#9A7488',
    accent: '#E2C48F',
    accentImage: 'linear-gradient(135deg, #B48A4E 0%, #F4E4C1 45%, #D9B98A 60%, #B48A4E 100%)',
    onAccent: '#2A0C21',
    accentSoft: '#4E1D3B',
    warn: '#F4BC86',
    warnSoft: '#4A2420',
    fontBody: JAKARTA,
    fontDisplay: "'Bodoni Moda', Didot, 'Times New Roman', serif",
    displayWeight: '500',
    displaySpacing: '0',
    titleStyle: 'italic',
    fontButton: JAKARTA,
    buttonWeight: '800',
    buttonSize: '13px',
    rSm: '4px',
    rMd: '3px',
    rLg: '8px',
    border: '1px',
    shadow: '0 14px 32px rgba(0,0,0,.35)',
    shadowSm: '0 2px 8px rgba(0,0,0,.30)',
    pictureBg: 'linear-gradient(160deg, #5A1F44, #2E0D24)',
    pictureIcon: '#E2C48F',
    btnCase: 'uppercase',
    btnSpacing: '2.5px',
    browserBar: '#2A0C21',
  },
  // Stiker: as girly as it gets. Pink everything, hearts, hot-pink outlines, rounded letters.
  stiker: {
    bg: '#FFF0F6',
    bgImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'%3E%3Cpath d='M14 18c-2.4-3.6-8.4-2.4-8.4 2.4 0 3.6 4.8 6 8.4 9.6 3.6-3.6 8.4-6 8.4-9.6 0-4.8-6-6-8.4-2.4z' fill='%23FFD1E6'/%3E%3Cpath d='M42 40c-1.6-2.4-5.6-1.6-5.6 1.6 0 2.4 3.2 4 5.6 6.4 2.4-2.4 5.6-4 5.6-6.4 0-3.2-4-4-5.6-1.6z' fill='%23F3D9FF'/%3E%3Cpath d='M44 12l1.2 3 3 1.2-3 1.2-1.2 3-1.2-3-3-1.2 3-1.2z' fill='%23FFC2DD'/%3E%3C/svg%3E\")",
    surface: '#FFE0EE',
    card: '#FFFFFF',
    line: '#F0569A',
    divider: '#FFD3E6',
    text: '#4A1032',
    textSoft: '#9A4E75',
    textFaint: '#D49AB8',
    accent: '#FF4FA3',
    accentImage: 'linear-gradient(180deg, #FF8AC2 0%, #FF4FA3 55%, #F23C92 100%)',
    onAccent: '#FFFFFF',
    accentSoft: '#FFE0EE',
    warn: '#A54600',
    warnSoft: '#FFF0D9',
    fontBody: JAKARTA,
    fontDisplay: "'Fredoka', " + JAKARTA,
    displayWeight: '600',
    displaySpacing: '-0.01em',
    titleStyle: 'normal',
    fontButton: "'Fredoka', " + JAKARTA,
    buttonWeight: '600',
    buttonSize: '18px',
    rSm: '18px',
    rMd: '999px',
    rLg: '26px',
    border: '2px',
    shadow: '4px 5px 0 #FFB0D3',
    shadowSm: '2px 3px 0 #FFB0D3',
    pictureBg: 'linear-gradient(135deg, #FFC4DF 0%, #E9CCFF 55%, #CBE6FF 100%)',
    pictureIcon: '#D6337E',
    btnCase: 'none',
    btnSpacing: '0px',
    browserBar: '#FFF0F6',
  },
};

// Only Butik and Stiker can be picked; the gold and sticker colours are used for decorations.
export const deco = { gold: '#D9B98A', goldDeep: '#8C6A3B', plum: '#2A0F22', pink: '#FF4FA3', berry: '#4A1032' };

const KEYS = Object.keys(NETRAL) as (keyof Tokens)[];
const v = (k: keyof Tokens) => `var(--sb-${k})`;

// CSS for <head>: one block of variables per skin.
export function skinCss() {
  const block = (t: Tokens) => KEYS.map((k) => `--sb-${k}:${t[k]};`).join('');
  return [
    `:root,[data-skin="netral"]{${block(NETRAL)}}`,
    `[data-skin="butik"]{${block(SKINS.butik)}}`,
    `[data-skin="stiker"]{${block(SKINS.stiker)}}`,
  ].join('\n');
}

export const colors = {
  bg: v('bg'),
  surface: v('surface'),
  card: v('card'),
  line: v('line'),
  divider: v('divider'),
  text: v('text'),
  textSoft: v('textSoft'),
  textFaint: v('textFaint'),
  accent: v('accent'),
  onAccent: v('onAccent'),
  accentSoft: v('accentSoft'),
  warn: v('warn'),
  warnSoft: v('warnSoft'),
  ink: '#111114', // real-money screens use dark, never pink, in every skin
  white: '#FFFFFF',
};

// React Native's types want numbers here; the browser happily takes the CSS variable.
const css = (k: keyof Tokens) => v(k) as unknown as number;

export const radius = { sm: css('rSm'), md: css('rMd'), lg: css('rLg'), pill: 999 };
export const shape = {
  border: css('border'),
  shadow: v('shadow'),
  bgImage: v('bgImage'),
  accentImage: v('accentImage'),
  shadowSm: v('shadowSm'),
  pictureBg: v('pictureBg'),
  pictureIcon: v('pictureIcon'),
  btnCase: v('btnCase') as 'none',
  btnSpacing: css('btnSpacing'),
};

export const maxWidth = 440; // keep a phone-sized column on big screens

// Body text uses --sb-fontBody everywhere (see +html.tsx); <Display> text uses --sb-fontDisplay.
export const type = {
  hero: { fontSize: 34, lineHeight: 38, fontWeight: '800' as const, letterSpacing: -0.6 },
  title: { fontSize: 26, lineHeight: 32, fontWeight: '800' as const, letterSpacing: -0.4 },
  h2: { fontSize: 18, lineHeight: 24, fontWeight: '700' as const },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' as const },
  small: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '600' as const, letterSpacing: 0.3 },
  money: { fontSize: 32, lineHeight: 38, fontWeight: '800' as const, letterSpacing: -0.6 },
};
