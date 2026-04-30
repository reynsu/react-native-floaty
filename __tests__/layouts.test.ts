import { rowLayout } from '../src/layouts/row';
import { arcLayout } from '../src/layouts/arc';
import { defaultTheme } from '../src/theme';

describe('rowLayout', () => {
  it('barStyle is flex row', () => {
    expect(rowLayout.barStyle()).toEqual({
      flexDirection: 'row',
      alignItems: 'center',
    });
  });

  it('actionStyle is empty (per-button styling not needed)', () => {
    expect(rowLayout.actionStyle()).toEqual({});
  });
});

describe('arcLayout', () => {
  const radius = 70;
  const theme = defaultTheme;

  it('barStyle declares enough space for radius + actionH', () => {
    const s = arcLayout.barStyle(theme, radius) as Record<string, unknown>;
    expect(s.width).toBe(radius * 2 + theme.actionH);
    expect(s.height).toBe(radius + theme.actionH);
    expect(s.backgroundColor).toBe('transparent');
  });

  it('positions buttons along a half-circle (i=0 at left, i=n-1 at right)', () => {
    const n = 4;
    const positions = Array.from({ length: n }, (_, i) =>
      arcLayout.actionStyle(i, n, theme, radius),
    ) as Array<Record<string, number>>;

    // First button (i=0) is at angle π → cos=-1 → x = 0 (left edge of container)
    expect(positions[0]!.left).toBeCloseTo(0, 5);
    // Last button (i=n-1) is at angle 2π → cos=1 → x = 2·radius (right edge minus actionH)
    expect(positions[n - 1]!.left).toBeCloseTo(radius * 2, 5);
    // Edge buttons sit at baseline (top = radius); middle buttons higher (smaller top)
    expect(positions[0]!.top).toBeCloseTo(radius, 5);
    expect(positions[n - 1]!.top).toBeCloseTo(radius, 5);
    const middleTop = positions[Math.floor(n / 2)]!.top;
    expect(middleTop).toBeLessThan(positions[0]!.top);
    // All buttons stay within the container height (radius + actionH); tolerance for floating-point math
    const containerHeight = radius + theme.actionH;
    positions.forEach((p) => {
      expect(p.top).toBeGreaterThanOrEqual(-1e-6);
      expect(p.top + theme.actionH).toBeLessThanOrEqual(containerHeight + 1e-6);
    });
  });

  it('handles n=1 without divide-by-zero', () => {
    const s = arcLayout.actionStyle(0, 1, theme, radius) as Record<string, number>;
    expect(Number.isFinite(s.left)).toBe(true);
    expect(Number.isFinite(s.top)).toBe(true);
  });
});
