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
    // Sweep from 180° (left baseline) → 270° (top) → 360° (right baseline)
    // along the upper half of a circle. Container size is set in barStyle so
    // that the leftmost/rightmost buttons sit at x=0 / x=2·radius and the
    // baseline buttons sit at y=radius (button top), leaving actionH of room
    // above for the apex.
    const angle = Math.PI + (Math.PI * i) / Math.max(n - 1, 1);
    const cx = radius + theme.actionH / 2;
    const cy = radius + theme.actionH / 2;
    return {
      position: 'absolute',
      left: cx + radius * Math.cos(angle) - theme.actionH / 2,
      top: cy + radius * Math.sin(angle) - theme.actionH / 2,
      width: theme.actionH,
      height: theme.actionH,
    };
  },
};
