// Phone app version: draws the icon data with react-native-svg.
// (The web uses Icon.web.tsx, which needs no extra library.)
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '@/theme';
import { ICONS, type IconName } from './iconShapes';

export type { IconName };

type Props = { name: IconName; size?: number; color?: string; strokeWidth?: number };

export function Icon({ name, size = 24, color = colors.text, strokeWidth = 1.75 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name].map((s, i) =>
        s[0] === 'p' ? (
          <Path key={i} d={s[1]} />
        ) : s[0] === 'r' ? (
          <Rect key={i} x={s[1]} y={s[2]} width={s[3]} height={s[4]} rx={s[5]} />
        ) : (
          <Circle key={i} cx={s[1]} cy={s[2]} r={s[3]} />
        ),
      )}
    </Svg>
  );
}
