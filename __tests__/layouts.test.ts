import { rowLayout } from '../src/layouts/row';
import { radialLayout } from '../src/layouts/radial';
import { defaultTheme } from '../src/theme';

describe('radialLayout flags', () => {
  it('declares iconOnly + floatingButtons', () => {
    expect(radialLayout.iconOnly).toBe(true);
    expect(radialLayout.floatingButtons).toBe(true);
  });

  it('provides an ornament renderer that returns a node', () => {
    expect(typeof radialLayout.ornament).toBe('function');
    const node = radialLayout.ornament!(defaultTheme, 70);
    expect(node).toBeTruthy();
  });
});

describe('rowLayout flags', () => {
  it('does not enforce iconOnly or floatingButtons', () => {
    expect(rowLayout.iconOnly).toBeUndefined();
    expect(rowLayout.floatingButtons).toBeUndefined();
  });

  it('has no ornament', () => {
    expect(rowLayout.ornament).toBeUndefined();
  });
});

describe('rowLayout', () => {
  it('barStyle is flex row', () => {
    expect(rowLayout.barStyle(defaultTheme, 0)).toEqual({
      flexDirection: 'row',
      alignItems: 'center',
    });
  });

  it('actionStyle is empty (per-button styling not needed)', () => {
    expect(rowLayout.actionStyle(0, 1, defaultTheme, 0)).toEqual({});
  });
});

describe('radialLayout', () => {
  const radius = 70;
  const theme = defaultTheme;

  it('barStyle is a square sized for full 360° orbit', () => {
    const s = radialLayout.barStyle(theme, radius) as Record<string, unknown>;
    expect(s.width).toBe(radius * 2 + theme.actionH);
    expect(s.height).toBe(radius * 2 + theme.actionH);
    expect(s.backgroundColor).toBe('transparent');
  });

  it('distributes buttons evenly around 360° starting at top', () => {
    const n = 4;
    const positions = Array.from({ length: n }, (_, i) =>
      radialLayout.actionStyle(i, n, theme, radius),
    ) as Array<Record<string, number>>;

    const cx = radius;
    const cy = radius;

    // i=0 at angle -π/2 → top of circle (cos=0, sin=-1)
    expect(positions[0]!.left).toBeCloseTo(cx, 5);
    expect(positions[0]!.top).toBeCloseTo(0, 5);

    // i=1 at angle 0 → right side (cos=1, sin=0)
    expect(positions[1]!.left).toBeCloseTo(2 * radius, 5);
    expect(positions[1]!.top).toBeCloseTo(cy, 5);

    // i=2 at angle π/2 → bottom of circle (cos=0, sin=1) — KEY:
    // its top edge is at the container's bottom-minus-actionH, so the button
    // sits flush with the container bottom. That's the "lowest button stays
    // visible" guarantee — combined with `position: 'bottom'` + bottomInset.
    expect(positions[2]!.left).toBeCloseTo(cx, 5);
    expect(positions[2]!.top).toBeCloseTo(2 * radius, 5);

    // i=3 at angle π → left side (cos=-1, sin=0)
    expect(positions[3]!.left).toBeCloseTo(0, 5);
    expect(positions[3]!.top).toBeCloseTo(cy, 5);
  });

  it('every button stays within the container bounds', () => {
    const n = 8;
    const containerWidth = radius * 2 + theme.actionH;
    const containerHeight = radius * 2 + theme.actionH;
    const positions = Array.from({ length: n }, (_, i) =>
      radialLayout.actionStyle(i, n, theme, radius),
    ) as Array<Record<string, number>>;
    positions.forEach((p) => {
      expect(p.left).toBeGreaterThanOrEqual(-1e-6);
      expect(p.top).toBeGreaterThanOrEqual(-1e-6);
      expect(p.left + theme.actionH).toBeLessThanOrEqual(containerWidth + 1e-6);
      expect(p.top + theme.actionH).toBeLessThanOrEqual(containerHeight + 1e-6);
    });
  });

  it('handles n=1 without divide-by-zero', () => {
    const s = radialLayout.actionStyle(0, 1, theme, radius) as Record<string, number>;
    expect(Number.isFinite(s.left)).toBe(true);
    expect(Number.isFinite(s.top)).toBe(true);
  });
});
