// Web version: plain browser SVG, so the website doesn't ship the react-native-svg library.
import { colors } from '@/theme';
import { ICONS, type IconName } from './iconShapes';

export type { IconName };

type Props = { name: IconName; size?: number; color?: string; strokeWidth?: number };

export function Icon({ name, size = 24, color = colors.text, strokeWidth = 1.75 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {ICONS[name].map((s, i) =>
        s[0] === 'p' ? (
          <path key={i} d={s[1]} />
        ) : s[0] === 'r' ? (
          <rect key={i} x={s[1]} y={s[2]} width={s[3]} height={s[4]} rx={s[5]} />
        ) : (
          <circle key={i} cx={s[1]} cy={s[2]} r={s[3]} />
        ),
      )}
    </svg>
  );
}
