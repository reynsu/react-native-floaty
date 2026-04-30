import { Platform, type ViewStyle } from 'react-native';
import type { FloaterTheme } from './types';

const shadow: ViewStyle = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
  },
  android: { elevation: 12 },
  default: {},
}) as ViewStyle;

export const defaultTheme: FloaterTheme = {
  bg: 'rgb(255, 255, 255)',
  fg: 'rgb(20, 22, 28)',
  fgMuted: 'rgb(96, 102, 116)',
  border: 'rgba(0, 0, 0, 0.08)',
  danger: 'rgb(220, 38, 38)',
  radius: 16,
  radiusInner: 12,
  padding: 6,
  gap: 6,
  bottomInset: 16,
  width: 'auto',
  actionH: 44,
  actionPx: 12,
  actionPy: 10,
  actionFontSize: 16,
  actionFontWeight: '500',
  actionBg: 'rgba(0, 0, 0, 0.04)',
  actionBgPressed: 'rgba(0, 0, 0, 0.12)',
  shadow,
};

export function mergeTheme(partial?: Partial<FloaterTheme>): FloaterTheme {
  if (!partial) return defaultTheme;
  return {
    ...defaultTheme,
    ...partial,
    shadow: { ...defaultTheme.shadow, ...partial.shadow },
  };
}
