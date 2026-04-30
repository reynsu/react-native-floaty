import { defaultTheme, mergeTheme } from '../src/theme';

describe('mergeTheme', () => {
  it('returns defaults when no partial provided', () => {
    expect(mergeTheme()).toEqual(defaultTheme);
  });

  it('overrides single field, keeps others', () => {
    const merged = mergeTheme({ bg: '#000' });
    expect(merged.bg).toBe('#000');
    expect(merged.fg).toBe(defaultTheme.fg);
    expect(merged.radius).toBe(defaultTheme.radius);
  });

  it('deep-merges shadow object', () => {
    const merged = mergeTheme({ shadow: { shadowOpacity: 0.5 } });
    expect(merged.shadow.shadowOpacity).toBe(0.5);
    expect(merged.shadow.shadowColor).toBe(defaultTheme.shadow.shadowColor);
  });

  it('exports stable defaults', () => {
    expect(defaultTheme.actionH).toBe(44);
    expect(defaultTheme.radius).toBe(16);
  });

  it('returns the same shadow reference when caller does not override it', () => {
    // Optimization: avoid spread allocation when partial.shadow is undefined.
    const merged = mergeTheme({ bg: '#000' });
    expect(merged.shadow).toBe(defaultTheme.shadow);
  });

  it('returns identical reference for empty partial', () => {
    expect(mergeTheme()).toBe(defaultTheme);
  });
});
