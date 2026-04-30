# react-native-floaty

> Mobile-first floating action toolbar for React Native. Animated, dismiss-on-outside-tap, themable via tokens. **Zero animation/gesture dependencies.**

This is the React Native port of [`react-floaty`](https://github.com/reynsu/floaty). Same ergonomic API (`useFloaterActions().show([...])`), rendered with RN core primitives — `<Modal>`, `<Pressable>`, and the `Animated` API.

## Features

- 🪶 **~17 KB** bundled, zero animation/gesture peer deps
- 🎬 60fps animations via `useNativeDriver: true`
- 👆 Tap outside the bar to dismiss · Android hardware back closes
- ♿️ Honors `prefers-reduced-motion`
- 🎨 Themable via a tokens object (no CSS)
- 📐 Two layouts: `row` (default) and `arc` (180° fan)
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
| `layout` | `'row' \| 'arc'` | `'row'` | Buttons in a row, or arranged on a half-circle |
| `position` | `'bottom' \| 'top'` | `'bottom'` | Where the bar slides in from |
| `radius` | `number` | `actionH * 1.6` | Used by `arc` layout only |

### `useFloaterActions(): FloaterApi`

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

### `arc` — 180° fan

```
            (action 2)
   (action 1)          (action 3)
(action 0)                (action n-1)
```

```tsx
<FloaterActionsProvider layout="arc" radius={90}>
  <App />
</FloaterActionsProvider>
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
