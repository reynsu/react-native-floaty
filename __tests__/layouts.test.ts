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

    // First button (i=0) is at angle π → cos=-1 → leftmost
    expect(positions[0]!.left).toBeCloseTo(0 - theme.actionH / 2, 5);
    // Last button (i=n-1) is at angle 2π → cos=1 → rightmost
    expect(positions[n - 1]!.left).toBeCloseTo(
      radius * 2 - theme.actionH / 2,
      5,
    );
    // Middle buttons sit higher (smaller `top` numerically — top of half-circle)
    const middleTop = positions[Math.floor(n / 2)]!.top;
    const edgeTop = positions[0]!.top;
    expect(middleTop).toBeLessThan(edgeTop);
  });

  it('handles n=1 without divide-by-zero', () => {
    const s = arcLayout.actionStyle(0, 1, theme, radius) as Record<string, number>;
    expect(Number.isFinite(s.left)).toBe(true);
    expect(Number.isFinite(s.top)).toBe(true);
  });
});
