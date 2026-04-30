import { View } from 'react-native';
import type { LayoutModule } from './types';

const INNER_RING_RATIO = 0.4;

/**
 * Radial layout — buttons orbit a centre, evenly distributed across 360°.
 *
 * Geometry: container is a square `2·radius + actionH` per side. The circle
 * centre sits at `(radius + actionH/2, radius + actionH/2)`, so buttons span
 * exactly the container bounds — the topmost button (i=0, at -π/2) has its
 * top edge at y=0, and the bottom-most button has its bottom edge at the
 * container's bottom edge.
 *
 * Combined with `position: 'bottom'` + `theme.bottomInset`, the lowest button
 * sits exactly `bottomInset` pixels above the screen bottom — fully visible —
 * while the rest fan upward.
 *
 * Visual: bar background is hidden; each button renders as a self-contained
 * floating chip (`floatingButtons: true`). Two dashed reference rings sit
 * behind the buttons — outer ring at the orbit radius, inner ring as a small
 * decorative dot in the centre.
 *
 * Icon-only enforced (`iconOnly: true`).
 */
export const radialLayout: LayoutModule = {
  iconOnly: true,
  floatingButtons: true,

  barStyle: (theme, radius) => ({
    width: radius * 2 + theme.actionH,
    height: radius * 2 + theme.actionH,
    backgroundColor: 'transparent',
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    padding: 0,
  }),

  actionStyle: (i, n, theme, radius) => {
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

  ornament: (theme, radius) => {
    const cx = radius + theme.actionH / 2;
    const cy = radius + theme.actionH / 2;
    const innerR = radius * INNER_RING_RATIO;
    return (
      <>
        {/* Outer dashed ring — passes through the centres of the buttons. */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: theme.actionH / 2,
            top: theme.actionH / 2,
            width: 2 * radius,
            height: 2 * radius,
            borderRadius: radius,
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: theme.border,
          }}
        />
        {/* Inner dashed ring — small decorative dot in the centre. */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: cx - innerR,
            top: cy - innerR,
            width: 2 * innerR,
            height: 2 * innerR,
            borderRadius: innerR,
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: theme.border,
          }}
        />
      </>
    );
  },
};
