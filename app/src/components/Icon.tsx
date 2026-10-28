import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '@/theme';

// Simple outline icons drawn for Spirit Belongings (24×24, round strokes).
const ICONS = {
  // categories
  tumbler: (
    <>
      <Path d="M7 5h10l-1 2.5H8z" />
      <Path d="M8 7.5l1.1 12.2a1.6 1.6 0 0 0 1.6 1.3h2.6a1.6 1.6 0 0 0 1.6-1.3L16 7.5" />
      <Path d="M13 5l1.6-3" />
      <Path d="M15.7 10.5h1.2a2 2 0 0 1 2 2v2.2a2 2 0 0 1-2 2h-1.6" />
    </>
  ),
  bag: (
    <>
      <Path d="M5 8.5h14l-1.1 11.6a1.5 1.5 0 0 1-1.5 1.4H7.6a1.5 1.5 0 0 1-1.5-1.4z" />
      <Path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" />
    </>
  ),
  shoe: (
    <>
      <Path d="M3 15.5V9.8a1 1 0 0 1 1.3-.9l3.2 1.1 2.5-2.5 2 3.5c1.7 1.6 4.6 2.2 7 2.6a2 2 0 0 1 1.5 2v.9H3z" />
      <Path d="M3 18.5h18" />
      <Path d="M10.5 11.5l1.5-1M12 13.2l1.6-.9" />
    </>
  ),
  shirt: (
    <>
      <Path d="M8.5 3.5L4 6l1.8 4 2-1V20.5h8.4V9l2 1L20 6l-4.5-2.5a3.5 3.5 0 0 1-7 0z" />
    </>
  ),
  hijab: (
    <>
      <Path d="M12 2.5a6.5 6.5 0 0 0-6.5 6.5v3.2c0 2.7-1.3 5.2-3.5 6.8v2h20v-2c-2.2-1.6-3.5-4.1-3.5-6.8V9A6.5 6.5 0 0 0 12 2.5z" />
      <Path d="M9.2 9.8a2.8 2.8 0 0 1 5.6 0v1.5a2.8 2.8 0 0 1-5.6 0z" />
      <Path d="M7.8 17.2c1.3.9 2.7 1.3 4.2 1.3s2.9-.4 4.2-1.3" />
    </>
  ),
  skincare: (
    <>
      <Rect x={5} y={9} width={7} height={12} rx={2} />
      <Path d="M7 9V6h3v3M8.5 6V3.5" />
      <Path d="M14.5 13h4.5v6.5a1.5 1.5 0 0 1-1.5 1.5H16a1.5 1.5 0 0 1-1.5-1.5z" />
      <Path d="M15.5 13v-2h2.5v2" />
    </>
  ),
  phone: (
    <>
      <Rect x={6.5} y={2.5} width={11} height={19} rx={2.2} />
      <Path d="M10.5 18.5h3" />
    </>
  ),
  headphones: (
    <>
      <Path d="M4 15v-3a8 8 0 0 1 16 0v3" />
      <Rect x={3.5} y={14} width={4} height={6.5} rx={1.6} />
      <Rect x={16.5} y={14} width={4} height={6.5} rx={1.6} />
    </>
  ),
  watch: (
    <>
      <Circle cx={12} cy={12} r={5.5} />
      <Path d="M12 9.5V12l1.6 1.2" />
      <Path d="M9 7l.7-4.5h4.6L15 7M9 17l.7 4.5h4.6L15 17" />
    </>
  ),
  other: (
    <>
      <Rect x={3.5} y={8} width={17} height={12.5} rx={1.8} />
      <Path d="M3.5 12h17M12 8v12.5" />
      <Path d="M12 8c-1.5-3.5-5.5-3.5-5.5-1S10 8 12 8zM12 8c1.5-3.5 5.5-3.5 5.5-1S14 8 12 8z" />
    </>
  ),
  // interface
  back: <Path d="M15 18l-6-6 6-6" />,
  plus: <Path d="M12 5v14M5 12h14" />,
  minus: <Path d="M5 12h14" />,
  check: <Path d="M5 12.5l4.5 4.5L19 7.5" />,
  checkCircle: (
    <>
      <Circle cx={12} cy={12} r={9} />
      <Path d="M8.2 12.3l2.6 2.6 5-5.2" />
    </>
  ),
  lock: (
    <>
      <Rect x={5} y={10.5} width={14} height={10} rx={2} />
      <Path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  mail: (
    <>
      <Rect x={3} y={5} width={18} height={14} rx={2} />
      <Path d="M3.5 6.5l8.5 6 8.5-6" />
    </>
  ),
  qr: (
    <>
      <Rect x={4} y={4} width={6} height={6} rx={1} />
      <Rect x={14} y={4} width={6} height={6} rx={1} />
      <Rect x={4} y={14} width={6} height={6} rx={1} />
      <Path d="M14 14h2.5v2.5H14zM19.5 14v.01M14 19.5h.01M17 17h3v3h-3" />
    </>
  ),
  wallet: (
    <>
      <Path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3" />
      <Rect x={4} y={8} width={16.5} height={11.5} rx={2} />
      <Path d="M16 13.7h1.5" />
    </>
  ),
  bank: (
    <>
      <Path d="M3 9.5L12 4l9 5.5z" />
      <Path d="M5.5 10v8M10 10v8M14 10v8M18.5 10v8M3 20.5h18" />
    </>
  ),
  card: (
    <>
      <Rect x={3} y={5.5} width={18} height={13} rx={2} />
      <Path d="M3 10h18M7 15h4" />
    </>
  ),
  truck: (
    <>
      <Path d="M3 6.5h11v9.5H3zM14 10h3.8l3.2 3.2V16H14" />
      <Circle cx={7} cy={18} r={1.8} />
      <Circle cx={17.5} cy={18} r={1.8} />
    </>
  ),
  image: (
    <>
      <Rect x={3} y={4} width={18} height={16} rx={2.5} />
      <Circle cx={9} cy={10} r={1.7} />
      <Path d="M20.5 15.5l-5-5-8.5 9" />
    </>
  ),
  target: (
    <>
      <Circle cx={12} cy={12} r={8.5} />
      <Circle cx={12} cy={12} r={4.5} />
      <Circle cx={12} cy={12} r={0.8} />
    </>
  ),
  alert: (
    <>
      <Circle cx={12} cy={12} r={9} />
      <Path d="M12 7.5v5.5M12 16.2v.01" />
    </>
  ),
  arrowRight: <Path d="M5 12h14M13 6l6 6-6 6" />,
  laptop: (
    <>
      <Rect x={4.5} y={5} width={15} height={10.5} rx={1.5} />
      <Path d="M2.5 18.5h19l-1.2-3H3.7z" />
    </>
  ),
  plane: <Path d="M21 15.5v-1.8l-7.5-4.6V4.2a1.5 1.5 0 0 0-3 0v4.9L3 13.7v1.8l7.5-2.3v4.6L8.5 19.3v1.5l3.5-1 3.5 1v-1.5l-2-1.5v-4.6z" />,
  share: (
    <>
      <Path d="M12 15V3.5M7.5 8L12 3.5 16.5 8" />
      <Path d="M5 12v7a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-7" />
    </>
  ),
  calendar: (
    <>
      <Rect x={3.5} y={5} width={17} height={15.5} rx={2} />
      <Path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  doc: (
    <>
      <Path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <Path d="M14 3v4h4M9 12h6M9 16h6" />
    </>
  ),
  sparkle: <Path d="M12 3l1.9 5.4L19.5 10l-5.6 1.6L12 17l-1.9-5.4L4.5 10l5.6-1.6z" />,
  settings: (
    <>
      <Path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
      <Circle cx={15} cy={7} r={2} />
      <Circle cx={9} cy={17} r={2} />
    </>
  ),
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  size = 24,
  color = colors.text,
  strokeWidth = 1.75,
}: {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICONS[name]}
    </Svg>
  );
}
