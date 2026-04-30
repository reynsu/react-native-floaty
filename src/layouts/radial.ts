import type { ViewStyle } from 'react-native';
import type { FloaterTheme } from '../types';

/**
 * Radial layout — buttons orbit a centre, evenly distributed across 360°.
 *
 * Geometry: container is a square `2·radius + actionH` per side. The circle
 * centre sits at `(radius + actionH/2, radius + actionH/2)`, so buttons span
 * exactly the container bounds — the topmost button (i=0, at -π/2) has its
 * top edge at y=0, and the bottom-most button has its bottom edge at the
 * container's bottom edge.
 *
 * Combined with `position: 'bottom'` + `theme.bottomInset`, this means the
 * lowest button sits exactly `bottomInset` pixels above the screen bottom —
 * fully visible — while the rest fan upward.
 *
 * Bar background is hidden (each button is its own circle via `iconOnly`'s
 * pill border-radius in ActionButton).
 */
export const radialLayout = {
  barStyle: (theme: FloaterTheme, radius: number): ViewStyle => ({
    width: radius * 2 + theme.actionH,
    height: radius * 2 + theme.actionH,
    backgroundColor: 'transparent',
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    padding: 0,
  }),
  actionStyle: (i: number, n: number, theme: FloaterTheme, radius: number): ViewStyle => {
    // Start at top (-π/2) and sweep clockwise, distributing evenly across 360°.
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / Math.max(n, 1);
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
