# react-native-floaty

> Mobile-first floating action toolbar for React Native. Animated, dismiss-on-outside-tap, themable via tokens. **Zero animation/gesture dependencies.**

This is the React Native port of [`react-floaty`](https://github.com/reynsu/floaty). Same ergonomic API (`useFloaterActions().show([...])`), rendered with RN core primitives — `<Modal>`, `<Pressable>`, and the `Animated` API.

## Features

- 🪶 **~17 KB** bundled, zero animation/gesture peer deps
- 🎬 60fps animations via `useNativeDriver: true`
- 👆 Tap outside the bar to dismiss · Android hardware back closes
- ♿️ Honors `prefers-reduced-motion`
- 🎨 Themable via a tokens object (no CSS)
- 📐 Two layouts: `row` (default) and `radial` (360° orbit)
- 📦 ESM + CJS, full TypeScript types

## Install

```sh
npm i react-native-floaty
# or: pnpm add react-native-floaty / yarn add react-native-floaty
```

Peer deps: `react >= 18`, `react-native >= 0.74`.

## Quickstart

```tsx
import { FloaterActionsProvider, useFloaterActions } from 'react-native-floaty';
import { View, Button } from 'react-native';

function Screen() {
  const { show } = useFloaterActions();
  return (
    <Button
      title="Bulk select"
      onPress={() =>
        show([
          { id: 'archive', label: 'Archive', onSelect: () => {} },
          { id: 'read',    label: 'Mark read', onSelect: () => {} },
          { id: 'delete',  label: 'Delete', variant: 'danger', onSelect: () => {} },
        ])
      }
    />
  );
}

export default function App() {
  return (
    <FloaterActionsProvider>
      <Screen />
    </FloaterActionsProvider>
  );
}
```

## API

### `<FloaterActionsProvider>`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `maxVisible` | `number` | `3` | Extras collapse into a `+` overflow popover |
| `closeOnOutsideTap` | `boolean` | `true` | Tap on backdrop closes the bar |
| `closeOnBackPress` | `boolean` | `true` | Android hardware back closes the bar |
| `theme` | `Partial<FloaterTheme>` | — | Deep-merged with [`defaultTheme`](#theming) |
| `layout` | `'row' \| 'radial'` | `'row'` | Buttons in a row, or evenly distributed around 360° |
| `position` | `'bottom' \| 'top'` | `'bottom'` | Where the bar slides in from |
| `radius` | `number` | `actionH * 1.6` | Used by `radial` layout only |

### Hooks

Four hooks ship — pick the narrowest one for the job to avoid unnecessary re-renders.

| Hook | Returns | Subscribes to | Use when |
|---|---|---|---|
| `useFloaterApi()` | `{ show, hide, toggle }` | nothing — methods are stable | The component **triggers** the bar but doesn't read its state. **Best for most call sites.** |
| `useFloaterOpen()` | `boolean` | just `open` | You need to react to bar visibility (e.g. dim a panel underneath). |
| `useFloaterState()` | `{ open, actions, options }` | full state | You need to mirror what's currently in the bar. Rarely needed. |
| `useFloaterActions()` | `{ ...state, ...api }` | full state | Convenience for v0.1 ergonomics. **Re-renders on every state change** — prefer the narrower hooks for new code. |

```ts
// Common pattern — trigger the bar without re-rendering on its state.
function ArchiveButton({ ids }: { ids: string[] }) {
  const { show } = useFloaterApi();
  return (
    <Button
      title={`Archive (${ids.length})`}
      onPress={() => show([{ id: 'a', label: 'Archive', onSelect: () => archive(ids) }])}
    />
  );
}
```

```ts
type FloaterApi = {
  open: boolean;
  actions: FloaterAction[];
  options: ShowOptions;
  show: (actions: FloaterAction[], options?: ShowOptions) => void;
  hide: () => void;
  toggle: (actions?: FloaterAction[]) => void;
};
```

### `FloaterAction`

```ts
type FloaterAction = {
  id: string;
  label?: string;     // text-only or text+icon
  icon?: ReactNode;   // any RN node — SVG, Text, Image, etc.
  ariaLabel?: string; // required when label is omitted
  onSelect: () => void;
  disabled?: boolean;
  variant?: 'default' | 'danger';
};
```

### `ShowOptions`

```ts
type ShowOptions = {
  maxVisible?: number;        // override provider's maxVisible
  dismissOnSelect?: boolean;  // default true; false = bar stays open
};
```

## Theming

Pass a partial theme to the provider — anything you don't override falls back to `defaultTheme`:

```tsx
<FloaterActionsProvider
  theme={{
    bg: '#111',
    fg: '#fff',
    border: 'rgba(255,255,255,0.08)',
    actionBgPressed: 'rgba(255,255,255,0.16)',
    radius: 28,
  }}
>
  <App />
</FloaterActionsProvider>
```

Full `FloaterTheme` shape:

```ts
type FloaterTheme = {
  bg: string;
  fg: string;
  fgMuted: string;
  border: string;
  danger: string;
  radius: number;
  radiusInner: number;
  padding: number;
  gap: number;
  bottomInset: number;        // px from bottom; default 16
  width: number | 'auto';
  actionH: number;            // button height; also drives icon-only width
  actionPx: number;
  actionPy: number;
  actionFontSize: number;
  actionFontWeight: '400' | '500' | '600' | '700';
  actionBg: string;
  actionBgPressed: string;
  shadow: ViewStyle;          // { shadowColor, shadowOffset, ... } on iOS, { elevation } on Android
};
```

## Layouts

### `row` (default)

```
┌────────────────────────────┐
│ [Archive] [Read] [Delete] [+] │
└────────────────────────────┘
```

### `radial` — 360° orbit (icon-only)

Buttons distribute evenly around a circle of `radius` pixels and render as
self-contained floating chips (white bg + shadow + circular border). Two
dashed reference rings sit behind them — an outer ring through the button
centres and a small inner ring as a decorative dot.

Combined with the default `position: 'bottom'` and `theme.bottomInset`, the
lowest button (south of the orbit) sits exactly `bottomInset` pixels above the
screen bottom — fully visible — while the rest fan upward and around.

```
        (i=0, top)
(i=n-1)             (i=1)
(i=...)  ◌  (i=...)         ← inner dashed dot
        (i=n/2, bottom — sits at bottomInset)
```

**Icon-only enforced.** Actions with `label` set will have it suppressed
visually (the label still becomes the `accessibilityLabel`); a dev warning
fires the first time each labeled action is shown.

```tsx
<FloaterActionsProvider layout="radial" radius={90}>
  <App />
</FloaterActionsProvider>

// Trigger with icon-only actions:
const { show } = useFloaterApi();
show([
  { id: 'heart', icon: <HeartIcon />, ariaLabel: 'Like',     onSelect: like },
  { id: 'save',  icon: <SaveIcon />,  ariaLabel: 'Bookmark', onSelect: save },
  { id: 'share', icon: <ShareIcon />, ariaLabel: 'Share',    onSelect: share },
  { id: 'pin',   icon: <PinIcon />,   ariaLabel: 'Pin',      onSelect: pin },
  { id: 'copy',  icon: <CopyIcon />,  ariaLabel: 'Copy',     onSelect: copy },
  { id: 'trash', icon: <TrashIcon />, ariaLabel: 'Delete',   variant: 'danger', onSelect: del },
], { maxVisible: 6 });
```

## Differences from `react-floaty` (web)

| Feature | Web | React Native |
|---|---|---|
| Outside dismiss | `pointerdown` on document | `<Pressable>` backdrop |
| Escape close | `keydown` Escape | Android back button only (no iOS equivalent) |
| Mount target | `createPortal(document.body)` | `<Modal transparent>` |
| Theming | CSS custom properties | Tokens object (`theme` prop) |
| Animation | CSS `transition` | `Animated.parallel` w/ `useNativeDriver` |
| Reduced motion | `@media (prefers-reduced-motion)` | `AccessibilityInfo.isReduceMotionEnabled` |

The shared API (`FloaterAction`, `ShowOptions`, `FloaterApi`) is byte-identical between the two packages — `ariaLabel` keeps its name (mapped to `accessibilityLabel` internally on RN).

## License

MIT © reynsu
