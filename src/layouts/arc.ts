import type { ViewStyle } from 'react-native';
import type { FloaterTheme } from '../types';

/**
 * Half-circle layout — buttons sit on the upper half of a circle of `radius`.
 * Each button is statically positioned via cos/sin; no animation needed.
 *
 * Bar dimensions: width = 2·radius + actionH, height = radius + actionH.
 * Bar background is hidden — each button is its own circle (uses iconOnly
 * border-radius from ActionButton).
 */
export const arcLayout = {
  barStyle: (theme: FloaterTheme, radius: number): ViewStyle => ({
    width: radius * 2 + theme.actionH,
    height: radius + theme.actionH,
    backgroundColor: 'transparent',
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    padding: 0,
  }),
  actionStyle: (i: number, n: number, theme: FloaterTheme, radius: number): ViewStyle => {
    // Sweep from 180° (left) to 360° (right) along the upper half.
    const angle = Math.PI + (Math.PI * i) / Math.max(n - 1, 1);
    const cx = radius;
    const cy = radius;
    return {
      position: 'absolute',
      left: cx + radius * Math.cos(angle) - theme.actionH / 2,
      top: cy + radius * Math.sin(angle) + radius - theme.actionH / 2,
      width: theme.actionH,
      height: theme.actionH,
    };
  },
};
