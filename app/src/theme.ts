// Spirit Belongings has two skins (owner decision 2026-10-29): Butik (luxury) and Stiker (Y2K).
// Styles point at CSS variables; the skin chosen on <html data-skin="..."> fills them in,
// so switching skins is instant and every screen shares one layout.
// "netral" is the plain minimal look, used before a skin is picked and on real-money screens.

export type SkinName = 'butik' | 'stiker';

type Tokens = {
  bg: string;
  surface: string; // picture boxes, inputs, subtle cards
  card: string;
  line: string; // borders of cards, inputs, buttons
  divider: string; // thin lines between rows
  text: string;
  textSoft: string;
  textFaint: string;
  accent: string; // main buttons and "saved" amounts
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
  btnCase: string; // text-transform of button labels
  btnSpacing: string; // letter-spacing of button labels
};

const JAKARTA = "'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

const NETRAL: Tokens = {
  bg: '#FFFFFF',
  surface: '#F5F5F7',
  card: '#FFFFFF',
  line: '#E7E7EB',
  divider: '#E7E7EB',
  text: '#111114',
  textSoft: '#6B6B73',
  textFaint: '#A1A1AA',
  accent: '#D6336C',
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
  btnCase: 'none',
  btnSpacing: '0px',
};

export const SKINS: Record<SkinName | 'netral', Tokens> = {
  netral: NETRAL,
  butik: {
    bg: '#F7F1EA',
    surface: '#EFE4D8',
    card: '#FBF7F2',
    line: '#E3D6C6',
    divider: '#E3D6C6',
    text: '#2A0F22',
    textSoft: '#7D6A5E',
    textFaint: '#B3A395',
    accent: '#2A0F22',
    onAccent: '#F7F1EA',
    accentSoft: '#F1DFE6',
    warn: '#9A4A16',
    warnSoft: '#F6E7D6',
    fontBody: JAKARTA,
    fontDisplay: "'Bodoni Moda', Didot, 'Times New Roman', serif",
    displayWeight: '500',
    displaySpacing: '0',
    titleStyle: 'italic',
    fontButton: JAKARTA,
    buttonWeight: '700',
    buttonSize: '13px',
    rSm: '4px',
    rMd: '3px',
    rLg: '6px',
    border: '1px',
    shadow: 'none',
    btnCase: 'uppercase',
    btnSpacing: '2.5px',
  },
  stiker: {
    bg: '#FFF5FB',
    surface: '#FFE3F2',
    card: '#FFFFFF',
    line: '#111111',
    divider: '#F1DDE8',
    text: '#111111',
    textSoft: '#55505A',
    textFaint: '#9A93A0',
    accent: '#FF4FA3',
    onAccent: '#FFFFFF',
    accentSoft: '#FFE3F2',
    warn: '#8A3B00',
    warnSoft: '#FFF6B8',
    fontBody: JAKARTA,
    fontDisplay: "'Bricolage Grotesque', " + JAKARTA,
    displayWeight: '800',
    displaySpacing: '-0.035em',
    titleStyle: 'normal',
    fontButton: "'Bricolage Grotesque', " + JAKARTA,
    buttonWeight: '800',
    buttonSize: '17px',
    rSm: '14px',
    rMd: '999px',
    rLg: '22px',
    border: '2.5px',
    shadow: '4px 4px 0 #111111',
    btnCase: 'none',
    btnSpacing: '0px',
  },
};

// Only Butik and Stiker can be picked; the gold and sticker colours are used for decorations.
export const deco = { gold: '#D9B98A', goldDeep: '#8C6A3B', plum: '#2A0F22', lime: '#E8FF5A', ink: '#111111' };

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
